import { model, Model } from 'mongoose'

import { UserSchema, IUser, IUserClass } from './schemas/User.schema'
import { OrganisationSchema, IOrganisation, IOrganisationClass } from './schemas/Organisation.schema'
import { MessageSchema, IMessage } from './schemas/Message.schema'
import { AuthCodeSchema, IAuthCode, IAuthCodeClass } from './schemas/AuthCode.schema'

export const User = model<IUser, IUserClass>(
  'User', UserSchema
)

export const Organisation = model<IOrganisation, IOrganisationClass>(
  'Organisation', OrganisationSchema
)

export const Message = model<IMessage>(
  'Message', MessageSchema
)

export const AuthCode = model<IAuthCode, IAuthCodeClass>(
  'AuthCode', AuthCodeSchema
)

// namespace models {
//   export type User = IUserClass
//   export type Organisation = Model<IOrganisation>
//   export type Message = Model<IMessage>
//   export type AuthCode = IAuthCodeClass
// }
