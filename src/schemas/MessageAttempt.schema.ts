import { Schema, Types } from 'mongoose'
import { MessageAttemptState } from '@/src/types'

const schemaOptions = {
  timestamps: true
}

export interface IMessageAttempt extends Types.Subdocument {
  state: MessageAttemptState
  recipient: Schema.Types.ObjectId
  donor: Schema.Types.ObjectId
  previousAttempt: Schema.Types.ObjectId | null
}

export const MessageAttemptSchema = new Schema({
  state: {
    type: String,
    enum: Object.values(MessageAttemptState),
    required: true
  },
  recipient: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  donor: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  previousAttempt: {
    type: Schema.Types.ObjectId,
    default: null,
    ref: 'Message.attempts'
  }
}, schemaOptions)
