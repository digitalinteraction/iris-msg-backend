import { Schema, Document } from 'mongoose'

const schemaOptions = {
  timestamps: true
}

export interface IUser extends Document {
  phoneNumber: String
  fcmToken: String | null
  verifiedOn: Date | null
}

export const UserSchema = new Schema({
  phoneNumber: {
    type: String,
    index: true,
    unique: true
  },
  fcmToken: {
    type: String
  },
  verifiedOn: {
    type: Date
  }
}, schemaOptions)
