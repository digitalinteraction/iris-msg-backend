import {
  RouteContext,
  AllMessageAttemptStates,
  MessageAttemptState,
  MemberRole,
  FcmType
} from '@/src/types'

import {
  IMessageAttempt,
  IMessage,
  IOrganisation,
  IMember,
  IModelSet
} from '@/src/models'

import { makeFirebaseMessenger, sendTwilioMessage } from '@/src/services'
import { shuffleArray } from '@/src/utils'
import { Types } from 'mongoose'

function makeError (name: string) {
  return `api.messages.attempts_update.${name}`
}

const RetryStates = [
  MessageAttemptState.Rejected,
  MessageAttemptState.Failed,
  MessageAttemptState.NoService,
  MessageAttemptState.NoSmsData,
  MessageAttemptState.RadioOff,
  MessageAttemptState.NoSenders,
  MessageAttemptState.NoResponse
]

interface IAttemptUpdate {
  attempt: string,
  newState: MessageAttemptState
}

interface IMessageAndAttempt {
  message?: IMessage
  attempt?: IMessageAttempt
}

interface ITwilioMessage {
  user: Types.ObjectId
  body: string
}

enum UpdateResult {
  Twilio, Reallocated, Sent, Failed
}

export default async ({ req, api, models, authJwt }: RouteContext) => {
  
  let { updates: rawUpdates } = req.body
  
  let errors = new Set<string>()
  if (!rawUpdates) errors.add(makeError('badAttempts'))
  if (!Array.isArray(rawUpdates)) errors.add(makeError('badAttempts'))
  if (!authJwt) errors.add('api.general.badAuth')
  
  if (errors.size > 0) throw errors
  
  rawUpdates.forEach((item: any) => {
    let isValid = item.attempt &&
      Types.ObjectId.isValid(item.attempt) &&
      item.newState &&
      AllMessageAttemptStates.includes(item.newState)
  
    if (!isValid) {
      errors.add(makeError('badAttempts'))
    }
  })
  
  if (errors.size > 0) throw errors
  
  let updates = rawUpdates as IAttemptUpdate[]
  
  // Fetch messages for the updates
  let messages = await models.Message.find({
    attempts: {
      $elemMatch: {
        _id: updates.map(s => s.attempt),
        state: MessageAttemptState.Pending
      }
    }
  }).populate({
    path: 'organisation',
    match: {
      deletedOn: null,
      members: {
        $elemMatch: {
          role: MemberRole.Donor,
          user: authJwt!.usr,
          deletedOn: null,
          confirmedOn: { $ne: null }
        }
      }
    }
  })
  
  // Build up of sms & fcm to send
  let smsToSend = new Array<IMessageAttempt>()
  let fcmUpdates = new Set<string>()
  
  // Process each update
  let promises = updates.map(async state => {
    let { message, attempt } = getMessageAndAttempt(state.attempt, messages)
    if (!attempt || !message || !message.organisation) return
    
    // Update the attempt
    let result = processAttemptUpdate(
      attempt!, state.newState, message, message.organisation as any
    )
    
    // Store info depending on the result
    switch (result) {
      case UpdateResult.Twilio:
        return smsToSend.push(attempt)
      case UpdateResult.Reallocated:
        return fcmUpdates.add(attempt.donor.toHexString())
    }
  })
  
  // Send fcms
  let firebase = makeFirebaseMessenger()
  let donors = await models.User.find({ _id: Array.from(fcmUpdates) })
  await Promise.all(donors.map(user => {
    if (!user.fcmToken) return Promise.resolve({})
    return firebase.send({
      notification: {
        title: 'New donations',
        body: 'You have new pending donations'
      },
      data: {
        type: FcmType.NewDonations
      },
      token: user.fcmToken!
    })
  }))
  
  // Send twilios
  await Promise.all(smsToSend.map(async attempt => {
    let message: IMessage = attempt.ownerDocument() as any
    
    let recipient = await models.User.findById(attempt.recipient)
    if (!recipient) return
    
    return sendTwilioMessage(recipient.phoneNumber, message.content)
  }))
  
  // Save the messages
  await Promise.all(messages.map(m => m.save()))
  
  // Send back a success
  api.sendData('ok')
}

export function getMessageAndAttempt (
  attemptId: string, messages: IMessage[]): IMessageAndAttempt {
  
  for (let i in messages) {
    let message = messages[i]
    let attempt = message.attempts.id(attemptId)
    if (attempt) return { message, attempt }
  }
  return { message: undefined, attempt: undefined }
}

export function processAttemptUpdate (
  attempt: IMessageAttempt,
  state: MessageAttemptState,
  message: IMessage,
  organisation: IOrganisation
): UpdateResult {
  
  // Update the state
  attempt.state = state
  
  // If not a retry state, stop here
  if (!RetryStates.includes(state)) return UpdateResult.Sent
  
  // Get the donors that have already been used
  let usedDonors = message.attempts
    .filter(prevAttempt => prevAttempt.recipient.equals(attempt.recipient))
    .map(prevAttempt => prevAttempt.donor.toHexString())
  
  // Work out the donors we can use
  let potentialDonors = organisation.activeDonors
    .filter(member => !usedDonors.includes(member.user.toHexString()))
  
  // Randomly pick one of those donors
  let newDonor = shuffleArray(potentialDonors)[0]
  
  // If we have a donor, allocate it to them
  if (newDonor) {
    message.attempts.push({
      state: MessageAttemptState.Pending,
      recipient: attempt.recipient,
      donor: newDonor.id,
      prevAttempt: attempt.id
    })
    
    return UpdateResult.Reallocated
  } else if (process.env.TWILIO_FALLBACK) {
    
    // Add the twilio message
    message.attempts.push({
      state: MessageAttemptState.Twilio,
      recipient: attempt.recipient,
      donor: null,
      prevAttempt: attempt.id
    })
    
    return UpdateResult.Twilio
  } else {
    return UpdateResult.Failed
  }
}
