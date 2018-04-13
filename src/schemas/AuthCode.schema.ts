import { Model, Schema, Document, Types } from 'mongoose'

const schemaOptions = {
  timestamps: true
}

export type IAuthCodeClass = Model<IAuthCode> & {
  forUser (userId: Types.ObjectId): IAuthCode
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
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, schemaOptions)

let ModelType = typeof Model

AuthCodeSchema.static('forUser', function (this: typeof Model, userId: Types.ObjectId) {
  let model: IAuthCode = new this({
    user: userId,
    code: makeCode(),
    expiresOn: makeExpiry()
  })
  return model.save()
})

export function makeCode (): number {
  return Math.floor(Math.random() * 999999)
}

export function makeExpiry (): Date {
  let now = new Date()
  now.setMinutes(now.getMinutes() + 15)
  return now
}
