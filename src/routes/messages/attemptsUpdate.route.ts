import {
  RouteContext,
  AllMessageAttemptStates,
  MessageAttemptState,
  MemberRole
} from '@/src/types'

import {
  IMessageAttempt,
  IMessage,
  IOrganisation,
  IMember,
  IModelSet
} from '@/src/models'

import { makeTwilioClient } from '@/src/services'
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

interface IAttemptState {
  attempt: string,
  state: MessageAttemptState
}

interface IMessageAndAttempt {
  message?: IMessage
  attempt?: IMessageAttempt
}

enum UpdateResult {
  Twilio, Reallocated, Success, Failed
}

export default async ({ req, api, models, authJwt }: RouteContext) => {
  
  // let { attempts } = req.body.attempts
  //
  // let errors = new Set<string>()
  // if (!attempts) errors.add(makeError('badAttempts'))
  // if (!Array.isArray(attempts)) errors.add(makeError('badAttempts'))
  // if (!authJwt) errors.add('api.general.badAuth')
  //
  // if (errors.size > 0) throw errors
  //
  // attempts.forEach((item: any) => {
  //   let isValid = item.id &&
  //     Types.ObjectId.isValid(item.id) &&
  //     item.state &&
  //     AllMessageAttemptStates.includes(item.state)
  //
  //   if (!isValid) {
  //     errors.add(makeError('badAttempts'))
  //   }
  // })
  //
  // if (errors.size > 0) throw errors
  //
  // let attemptStates = attempts as IAttemptState[]
  //
  // // Fetch messages for the updates
  // let messages = await models.Message.find({
  //   attempts: {
  //     $elemMatch: {
  //       _id: attemptStates.map(s => s.attempt),
  //       state: MessageAttemptState.Pending
  //     }
  //   }
  // }).populate({
  //   name: 'organisation',
  //   match: {
  //     deletedOn: null,
  //     members: {
  //       $elemMatch: {
  //         role: MemberRole.Donor,
  //         user: authJwt!.usr,
  //         deletedOn: null,
  //         confirmedOn: { $ne: null }
  //       }
  //     }
  //   }
  // })
  //
  // attemptStates.forEach(async state => {
  //   let { message, attempt } = getMessageAndAttempt(state.attempt, messages)
  //   if (!attempt) errors.add(makeError('badAttempts'))
  //   if (!message || !message.organisation) errors.add(makeError('badAttempts'))
  // })
  //
  // if (errors.size > 0) throw errors
  //
  // await Promise.all(attemptStates.map(async state => {
  //   let { message, attempt } = getMessageAndAttempt(state.attempt, messages)
  //   let organisation = message!.organisation as any
  //
  //   return updateAttempt(attempt!, state.state, message!, organisation)
  // }))
  
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

export function updateAttempt (
  attempt: IMessageAttempt,
  state: MessageAttemptState,
  message: IMessage,
  organisation: IOrganisation
): UpdateResult {
  
  // Update the state
  attempt.state = state
  
  // If not a retry state, stop here
  if (!RetryStates.includes(state)) return UpdateResult.Success
  
  // Get the donors that have already been used
  let usedDonors = message.attempts
    .filter(prevAttempt => prevAttempt.recipient.equals(attempt.recipient))
    .map(prevAttempt => prevAttempt.donor)
  
  // Work out the donors we can use
  let potentialDonors = organisation.activeDonors
    .filter(member => !usedDonors.includes(member.id))
  
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
    console.log('Twilio Fallback')
    
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
