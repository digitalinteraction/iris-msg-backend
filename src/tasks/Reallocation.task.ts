import { Task } from './Task'
import { IMessageAttempt, IMessage, IOrganisation, IModelSet } from 'src/models'
import { shuffleArray } from '@/src/utils'
import { MessageAttemptState, FcmType } from '@/src/types'
import { sendTwilioMessage, makeFirebaseMessenger } from '@/src/services'
import winston = require('winston')

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
  
  async run ({ models, log }: ReallocationContext) {
    
    log.debug(`[ReallocationTask] started ${new Date().toISOString()}`)
    
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
    }).populate('organisation')
    
    log.debug(`[ReallocationTask] ${messages.length} messages to resend`)
    
    let smsToSend = new Array<IMessageAttempt>()
    let fcmToSend = new Set<string>()
    let reallocationCount = 0
    
    // Attempt to reallocate unsent attempts
    messages.forEach(message => {
      let org: IOrganisation = message.organisation as any
      if (!org) return
      
      // Look through each attempt (filtering out too-new / non-pending ones)
      message.attempts.forEach(attempt => {
        if (attempt.state !== MessageAttemptState.Pending) return
        if (attempt.createdAt >= reallocationPoint) return
        
        // Mark it as no-response
        attempt.state = MessageAttemptState.NoResponse
        reallocationCount++
        
        // Reallocate the message
        let result = this.processAttempt(
          attempt, message, org
        )
        
        // Handle each response
        switch (result.type) {
          case ReallocResult.Reallocated:
            return result.newUser && fcmToSend.add(result.newUser)
          case ReallocResult.Twilio:
            return smsToSend.push(attempt)
        }
      })
    })
    
    // Send fcm tokens
    await this.sendFcms(Array.from(fcmToSend), models)
    
    // Send fallback sms
    await this.sendTwilios(smsToSend, models)
    
    // Save the messages
    await Promise.all(messages.map(m => m.save()))
    
    // Log the result
    log.debug(`[ReallocationTask] Finished`, {
      resent: reallocationCount,
      sms: smsToSend.length,
      fcm: fcmToSend.size
    })
  }
  
  /** Process an attempt to reallocate to a new donor */
  processAttempt (
    attempt: IMessageAttempt, message: IMessage, organisation: IOrganisation
  ): Reallocation {
    
    // Get the donors that have already been used
    let usedDonorsIds = message.attempts
      .filter(prevAttempt => prevAttempt.recipient.equals(attempt.recipient))
      .reduce((set, attempt) =>
        set.add(attempt.donor.toHexString()
      ), new Set<string>())
    
    // Work out the donors we can use
    let potentialDonors = organisation.activeDonors
      .filter(member => !usedDonorsIds.has(member.user.toHexString()))
    
    // Randomly pick one of those donors
    let newDonor = shuffleArray(potentialDonors)[0]
    
    // If we have a donor, allocate it to them
    if (newDonor) {
      message.attempts.push({
        state: MessageAttemptState.Pending,
        recipient: attempt.recipient,
        donor: newDonor.user,
        prevAttempt: attempt.id
      })
      
      return { type: ReallocResult.Reallocated, newUser: newDonor.user.toString() }
    } else if (process.env.TWILIO_FALLBACK) {
      
      // Add the twilio message
      message.attempts.push({
        state: MessageAttemptState.Twilio,
        recipient: attempt.recipient,
        donor: null,
        prevAttempt: attempt.id
      })
      
      return { type: ReallocResult.Twilio }
    } else {
      return { type: ReallocResult.Failed }
    }
  }
  
  /** Send fcms to donors to let them know they have donations */
  async sendFcms (userIds: string[], models: IModelSet) {
    let firebase = makeFirebaseMessenger()
    let donors = await models.User.find({ _id: userIds })
    
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
  }
  
  /** Send twilio fallback sms */
  async sendTwilios (attempts: IMessageAttempt[], models: IModelSet) {
    return Promise.all(attempts.map(async attempt => {
      let message: IMessage = attempt.ownerDocument() as any
      
      let recipient = await models.User.findById(attempt.recipient)
      if (!recipient) return Promise.resolve()
      
      return sendTwilioMessage(recipient.phoneNumber, message.content)
    }))
  }
}
