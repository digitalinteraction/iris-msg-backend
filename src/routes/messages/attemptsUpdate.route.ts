import {
  RouteContext,
  AllMessageAttemptStates,
  MessageAttemptState,
  MemberRole
} from '@/src/types'

import {
  IMessageAttempt,
  IMessage
} from '@/src/models'

import {
  ReallocationTask, RetryStates, ReallocResult
} from '@/src/tasks'

import { Types } from 'mongoose'

function makeError (name: string) {
  return `api.messages.attempts_update.${name}`
}

interface IAttemptUpdate {
  attempt: string,
  newState: MessageAttemptState
}

interface IMessageAndAttempt {
  message?: IMessage
  attempt?: IMessageAttempt
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
  
  let reallocator = new ReallocationTask()
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
    match: models.Organisation.memberQuery(MemberRole.Donor, authJwt!.usr)
  })
  
  // Build up of sms & fcm to send
  let smsToSend = new Array<IMessageAttempt>()
  let fcmToSend = new Set<string>()
  
  // Process each update
  updates.map(update => {
    let { message, attempt } = getMessageAndAttempt(update.attempt, messages)
    if (!attempt || !message || !message.organisation) return
    
    attempt.state = update.newState
    
    // If not a retry state, stop here
    if (!RetryStates.includes(update.newState)) return
    
    // Update the attempt
    let result = reallocator.processAttempt(
      attempt!, message, message.organisation as any
    )
    
    // Store info depending on the result
    switch (result) {
      case ReallocResult.Twilio:
        return smsToSend.push(attempt)
      case ReallocResult.Reallocated:
        return fcmToSend.add(attempt.donor.toHexString())
    }
  })
  
  // Send fcms
  await reallocator.sendFcms(Array.from(fcmToSend), models)
  
  // Send twilios
  await reallocator.sendTwilios(smsToSend, models)
  
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
