import { Schema, Document, Types, Model } from 'mongoose'
import { MessageAttemptSchema, IMessageAttempt } from './MessageAttempt.schema'

const schemaOptions = {
  timestamps: true
}

export interface IMessage extends Document {
  content: string
  attempts: Types.DocumentArray<IMessageAttempt>
  organisation: Schema.Types.ObjectId
  author: Schema.Types.ObjectId
}

export type IMessageClass = Model<IMessage> & {
  // ...
}

export const MessageSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  attempts: {
    type: [MessageAttemptSchema]
  },
  organisation: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Organisation'
  },
  author: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, schemaOptions)
