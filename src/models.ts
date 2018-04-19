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

// export namespace Model {
//   export interface User extends IUserClass {}
//   export interface Organisation extends Model<IOrganisation> {}
//   export interface Message extends Model<IMessage> {}
//   export interface AuthCode extends IAuthCodeClass {}
// }
