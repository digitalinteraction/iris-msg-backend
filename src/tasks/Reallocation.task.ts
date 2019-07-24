import { Task } from './Task'
import { IMessageAttempt, IMessage, IOrganisation, IModelSet, IOrganisationWithUsers, IMemberWithUser, IMessageWithOrganisation } from 'src/models'
import { shuffleArray } from '@/src/utils'
import { MessageAttemptState, MemberRole } from '@/src/types'
import { sendTwilioMessage, makeFirebaseMessenger, sendNewDonationFcm } from '@/src/services'
import winston from 'winston'
import { LocalI18n } from '@/src/i18n'

export enum ReallocResult {
  Twilio = 'twilio',
  Reallocated = 'reallocated',
  Failed = 'failed'
}

export type Reallocation = {
  type: ReallocResult
  newUser?: string
}

export interface ReallocationContext {
  models: IModelSet
  i18n: LocalI18n
  log: winston.Logger
}

export const RetryStates = [
  MessageAttemptState.Rejected,
  MessageAttemptState.Failed,
  MessageAttemptState.NoService,
  MessageAttemptState.NoSmsData,
  MessageAttemptState.RadioOff,
  MessageAttemptState.NoResponse
]

function parseNumberOrDefault (value: any, fallback: number) {
  let parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

export const MaxDonationAge = parseNumberOrDefault(
  process.env.MAX_DONATION_AGE_IN_MINUTES, 30 * 60 * 1000
)

export const RellocationInterval = parseNumberOrDefault(
  process.env.DONOR_TICK_IN_MINUTES, 5 * 60 * 1000
)

// A task to regularly for check and reallocate donor's non-responses
export class ReallocationTask extends Task<ReallocationContext> {
  interval = RellocationInterval
  
  async run ({ models, i18n, log }: ReallocationContext) {
    
    let reallocationPoint = new Date()
    reallocationPoint.setMinutes(
      reallocationPoint.getMinutes() - (MaxDonationAge / 1000 / 60)
    )
    
    // Find messages which are older than process.env.DONATION_MAX_AGE
    let messages = await models.Message.find({
      attempts: {
        $elemMatch: {
          state: MessageAttemptState.Pending,
          createdAt: { $lte: reallocationPoint }
        }
      }
    })
    
    if (messages.length === 0) return
    
    log.debug(`[Reallocation] resending ${messages.length} messages`, {
      start: (new Date()).toISOString()
    })
    
    let smsToSend = new Array<IMessageAttempt>()
    let fcmToSend = new Set<string>()
    let reallocationCount = 0
    
    // Attempt to reallocate unsent attempts
    for (let message of messages) {
      let organisation: IOrganisationWithUsers = await models.Organisation
        .findOne(message.organisation)
        .populate('members.user') as any
      
      if (!organisation) continue
      
      // Look through each attempt (filtering out too-new / non-pending ones)
      // Uses Array.from() to prevent mutation during the iteration
      for (let attempt of Array.from(message.attempts)) {
        if (attempt.state !== MessageAttemptState.Pending) continue
        if (attempt.createdAt >= reallocationPoint) continue
        
        // Mark it as no-response
        attempt.state = MessageAttemptState.NoResponse
        reallocationCount++
        
        // Reallocate the message
        let result = this.processAttempt(attempt, message, organisation)
        
        // Handle each response
        switch (result.type) {
          case ReallocResult.Reallocated:
            result.newUser && fcmToSend.add(result.newUser)
            continue
          case ReallocResult.Twilio:
            smsToSend.push(attempt)
            continue
        }
      }
    }
    
    // Send fcm tokens
    await this.sendFcms(Array.from(fcmToSend), models, i18n, log)
    
    // Send fallback sms
    await this.sendTwilios(smsToSend, models, log)
    
    // Save the messages
    await Promise.all(messages.map(m => m.save()))
    
    // Log the result
    log.debug(`[Reallocation] Finished`, {
      resent: reallocationCount,
      sms: smsToSend.length,
      fcm: fcmToSend.size
    })
  }
  
  /** Process an attempt to reallocate to a new donor */
  processAttempt (
    attempt: IMessageAttempt,
    message: IMessage,
    organisation: IOrganisationWithUsers
  ): Reallocation {
    
    let usedDonorIds = new Set(
      Array.from(message.attempts)
        .filter(a => a.donor && a.recipient.equals(attempt.recipient))
        .map(a => a.donor!.toHexString())
    )
    
    // Work out the donors we can use
    let potentialDonors = organisation.members
      .filter(member =>
        member.isActive &&
        member.role === MemberRole.Donor &&
        member.user.fcmToken !== null &&
        !usedDonorIds.has(member.user.id)
      )
    
    // Randomly pick one of those donors
    let newDonor = shuffleArray(potentialDonors)[0]
    
    // If we have a donor, allocate it to them
    if (newDonor) {
      message.attempts.push({
        state: MessageAttemptState.Pending,
        recipient: attempt.recipient,
        donor: newDonor.user._id,
        previousAttempt: attempt.id
      })
      
      return {
        type: ReallocResult.Reallocated,
        newUser: newDonor.user.id
      }
    } else if (process.env.TWILIO_FALLBACK) {
      
      // Add the twilio message
      message.attempts.push({
        state: MessageAttemptState.Twilio,
        recipient: attempt.recipient,
        donor: null,
        previousAttempt: attempt.id
      })
      
      return { type: ReallocResult.Twilio }
    } else {
      return { type: ReallocResult.Failed }
    }
  }
  
  /** Send fcms to donors to let them know they have donations */
  async sendFcms (userIds: string[], models: IModelSet, i18n: LocalI18n, log: winston.Logger) {
    let messenger = makeFirebaseMessenger()
    let donors = await models.User.find({ _id: userIds })
    
    await Promise.all(donors.map(
      user => sendNewDonationFcm(messenger, user, i18n, log)
    ))
  }
  
  /** Send twilio fallback sms */
  async sendTwilios (attempts: IMessageAttempt[], models: IModelSet, log: winston.Logger) {
    return Promise.all(attempts.map(async attempt => {
      let message: IMessage = attempt.ownerDocument() as any
      
      let recipient = await models.User.findById(attempt.recipient)
      if (!recipient) return Promise.resolve()
      
      log.debug(`[Twilio] Sending sms to ${recipient.id}`)
      
      return sendTwilioMessage(recipient.phoneNumber, message.content)
    }))
  }
}
