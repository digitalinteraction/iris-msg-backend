import { Schema, Document, Model, DocumentQuery } from 'mongoose'

const schemaOptions = {
  timestamps: true
}

export interface IUser extends Document {
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
    default: 'GB'
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
