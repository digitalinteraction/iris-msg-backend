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
  models: IModelSet
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
  
  async run ({ models }: ReallocationContext) {
    
    // Find messages which are older than process.env.DONATION_MAX_AGE
    let messages = await models.Message.find({
      attempts: {
        $elemMatch: { state: MessageAttemptState.Pending }
      }
    }).populate('organisation')
    
    let smsToSend = new Array<IMessageAttempt>()
    let fcmToSend = new Set<string>()
    
    // Attempt to reallocate unsent attempts
    messages.forEach(message => {
      let org: IOrganisation = message.organisation as any
      if (!org) return
      
      message.attempts.forEach(attempt => {
        if (attempt.state !== MessageAttemptState.Pending) return
        
        attempt.state = MessageAttemptState.NoResponse
        
        let result = this.processAttempt(
          attempt, message, org
        )
        
        switch (result) {
          case ReallocResult.Reallocated:
            return fcmToSend.add(attempt.donor.toHexString())
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
  }
  
  /** Process an attempt to reallocate to a new donor */
  processAttempt (attempt: IMessageAttempt, message: IMessage, organisation: IOrganisation): ReallocResult {
    
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
