import { Schema, Document } from 'mongoose'

const schemaOptions = {
  timestamps: true
}

export interface IUser extends Document {
  phoneNumber: String
  fcmToken?: String
  verifiedOn?: Date
}

export const UserSchema = new Schema({
  phoneNumber: {
    type: String,
    index: true,
    unique: false
  },
  fcmToken: {
    type: String
  },
  verifiedOn: {
    type: Date
  }
}, schemaOptions)
