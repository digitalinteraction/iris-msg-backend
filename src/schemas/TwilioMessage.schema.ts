import { Model, Schema } from 'mongoose'
import { IBaseModel } from '@/src/types'

const schemaOptions = {
  timestamps: true
}

export enum MessagePriority {
  Low = 0,
  Medium = 5,
  High = 10
}

export enum TwilioMessageType {
  Invite = 'invite',
  Fallback = 'fallback'
}

export const AllTwilioMessageTypes = Object.values(TwilioMessageType)

export type ITwilioMessageClass = Model<ITwilioMessage> & {
  // ...
}

export interface ITwilioMessage extends IBaseModel {
  type: TwilioMessageType
  to: string
  body: string
  priority: number
}

export const TwilioMessageSchema = new Schema(
  {
    type: {
      type: String,
      enum: AllTwilioMessageTypes,
      required: true
    },
    to: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    priority: {
      type: Number,
      default: MessagePriority.Low
    }
  },
  schemaOptions
)
