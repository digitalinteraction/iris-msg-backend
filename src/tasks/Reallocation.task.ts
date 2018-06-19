import { Task } from './Task'
import { IMessageAttempt, IMessage, IOrganisation, IModelSet } from 'src/models'
import { shuffleArray } from '@/src/utils'
import { MessageAttemptState, FcmType } from '@/src/types'
import { sendTwilioMessage, makeFirebaseMessenger } from '@/src/services'

export enum ReallocResult {
  Twilio,
  Reallocated,
  Failed
}

export interface ReallocationContext {
  
}

export const RetryStates = [
  MessageAttemptState.Rejected,
  MessageAttemptState.Failed,
  MessageAttemptState.NoService,
  MessageAttemptState.NoSmsData,
  MessageAttemptState.RadioOff,
  MessageAttemptState.NoSenders,
  MessageAttemptState.NoResponse
]

// A task to regularly for check and reallocate donor's non-responses
export class ReallocationTask extends Task<ReallocationContext> {
  interval = process.env.DONOR_TICK || null
  
  async run (ctx: ReallocationContext) {
    
    // Find messages which are older than process.env.DONATION_MAX_AGE
    
    // Attempt to reallocate unsent attempts
    
    // Send fcm tokens
    
    // Send fallback sms
    
  }
  
  /** Process an attempt to reallocate to a new donor */
  processAttempt (attempt: IMessageAttempt, message: IMessage, organisation: IOrganisation): ReallocResult {
    
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
      
      return ReallocResult.Reallocated
    } else if (process.env.TWILIO_FALLBACK) {
      
      // Add the twilio message
      message.attempts.push({
        state: MessageAttemptState.Twilio,
        recipient: attempt.recipient,
        donor: null,
        prevAttempt: attempt.id
      })
      
      return ReallocResult.Twilio
    } else {
      return ReallocResult.Failed
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
      if (!recipient) return
      
      return sendTwilioMessage(recipient.phoneNumber, message.content)
    }))
  }
}
