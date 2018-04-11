import { Schema, Document, Types } from 'mongoose'
import { MessageAttemptSchema, IMessageAttempt } from './MessageAttempt.schema'

const schemaOptions = {
  timestamps: true
}

export interface IMessage extends Document {
  content: String
  attempts: Types.DocumentArray<IMessageAttempt>
  organisation: Schema.Types.ObjectId
  author: Schema.Types.ObjectId
}

export const MessageSchema = new Schema({
  content: {
    type: String
  },
  attempts: {
    type: [MessageAttemptSchema]
  },
  organisation: {
    type: Schema.Types.ObjectId,
    ref: 'Organisation'
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, schemaOptions)
