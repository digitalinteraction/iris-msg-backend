import { Model, Schema, Document, Types, DocumentQuery } from 'mongoose'
import { AuthCodeType } from '../types'

const schemaOptions = {
  timestamps: true
}

export type IAuthCodeClass = Model<IAuthCode> & {
  forUser (userId: Types.ObjectId, type: AuthCodeType): Promise<IAuthCode>
  fromCode (code: any, type: AuthCodeType): DocumentQuery<IAuthCode | null, IAuthCode>
}

export interface IAuthCode extends Document {
  code: Number
  expiresOn?: Date
  usedOn?: Date
  usedBy?: Schema.Types.ObjectId
  
  formatted: String
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
  type: {
    type: Object.values(AuthCodeType)
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, schemaOptions)

AuthCodeSchema.static('forUser', function (
  this: typeof Model, userId: Types.ObjectId, type: AuthCodeType) {
  let model: IAuthCode = new this({
    user: userId,
    code: makeCode(),
    expiresOn: makeExpiry(),
    type
  })
  return model.save()
})

AuthCodeSchema.static('fromCode', function
  (this: typeof Model, rawCode: any, type: AuthCodeType) {
  let code = parseInt(rawCode, 10)
  if (Number.isNaN(code)) return null
  return this.findOne({
    code,
    type,
    expiresOn: { $gte: new Date() } })
})

AuthCodeSchema.virtual('formatted').get(function (this: IAuthCode) {
  let formatted = this.code.toString()
  while (formatted.length < 6) {
    formatted = '0' + formatted
  }
  return formatted.slice(0, 3) + '-' + formatted.slice(3, 6)
})

export function makeCode (): number {
  return Math.floor(Math.random() * 999999)
}

export function makeExpiry (): Date {
  let now = new Date()
  now.setMinutes(now.getMinutes() + 15)
  return now
}
