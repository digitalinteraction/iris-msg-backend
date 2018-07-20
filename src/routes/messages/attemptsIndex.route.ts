import { RouteContext, MessageAttemptState } from '@/src/types'
import { IMessage, IMessageAttempt, IUser, IOrganisation } from '@/src/models'
import { Types } from 'mongoose'

// function makeError (name: string) {
//   return `api.messages.attempts_index.${name}`
// }

interface IMessageOutput {
  content: string
  author: string
  attempts: IAttemptOutput[]
}

interface IAttemptOutput {
  recipient: string,
  phoneNumber: string
}

type IMessageAttemptWithRecipient = {
  recipient: IUser
} & IMessageAttempt

type IMessagePopulated = {
  attempts: Types.DocumentArray<IMessageAttemptWithRecipient>
  organisation: IOrganisation
} & IMessage

export default async ({ req, api, models, authJwt }: RouteContext) => {
  
  // Fail if there is no user
  if (!authJwt) throw new Error('api.general.badAuth')
  
  // The query for messages
  let query = {
    attempts: {
      $elemMatch: {
        state: MessageAttemptState.Pending,
        donor: authJwt.usr
      }
    }
  }
  
  // Fetch messages which the user has pending donations
  let messages: IMessagePopulated[] = await models.Message
    .find(query)
    .populate('attempts.recipient')
    .populate('organisation') as any
  
  let formattedMessages = messages.map(message => {
    let attempts = message.attempts
      .filter(attempt =>
        attempt.donor.toString() === authJwt.usr &&
        attempt.state === MessageAttemptState.Pending
      )
      .map(attempt => ({
        _id: attempt._id,
        createdAt: (attempt as any).createdAt,
        updatedAt: (attempt as any).updatedAt,
        recipient: attempt.recipient.id,
        phoneNumber: attempt.recipient.phoneNumber
      }))
    return { ...message.toJSON(), attempts }
  })
  
  api.sendData(formattedMessages)
}
