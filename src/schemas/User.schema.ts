import { Schema, Model, DocumentQuery } from 'mongoose'
import { IBaseModel } from '@/src/types'

const schemaOptions = {
  timestamps: true
}

export interface IUser extends IBaseModel {
  phoneNumber: string
  locale: string
  fcmToken: string | null
  verifiedOn: Date | null
}

export type IUserClass = Model<IUser> & {
  findWithJwt (jwt: any): DocumentQuery<IUser | null, IUser>
}

export const UserSchema = new Schema({
  phoneNumber: {
    type: String,
    index: true,
    unique: true
  },
  locale: {
    type: String,
    default: 'en'
  },
  fcmToken: {
    type: String,
    default: null
  },
  verifiedOn: {
    type: Date,
    default: null
  }
}, schemaOptions)

UserSchema.static('findWithJwt', function (this: typeof Model, jwt: any) {
  if (!jwt || !jwt.usr) return Promise.resolve(null)
  return this.findOne({ _id: jwt.usr, verifiedOn: { $ne: null } })
})
