import { Schema, Types } from 'mongoose'
import { IBaseSubModel, MessageAttemptState } from '@/src/types'

const schemaOptions = {
  timestamps: true
}

export interface IMessageAttempt extends IBaseSubModel {
  state: MessageAttemptState
  recipient: Types.ObjectId
  donor: Types.ObjectId | null
  previousAttempt: Types.ObjectId | null
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
    default: null,
    ref: 'User'
  },
  previousAttempt: {
    type: Schema.Types.ObjectId,
    default: null,
    ref: 'Message.attempts'
  }
}, schemaOptions)
