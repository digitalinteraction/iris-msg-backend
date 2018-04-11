import { Schema, Document } from 'mongoose'

const schemaOptions = {
  timestamps: true
}

export interface IAuthCode extends Document {
  code: Number
  expiresOn?: Date
  usedOn?: Date
  usedBy?: Schema.Types.ObjectId
}

export const AuthCodeSchema = new Schema({
  code: {
    type: Number
  },
  expiresOn: {
    type: Date
  },
  usedOn: {
    type: Date
  },
  usedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, schemaOptions)
