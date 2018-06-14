import { Model, Connection, Types } from 'mongoose'

import { UserSchema, IUser, IUserClass } from './schemas/User.schema'
import { OrganisationSchema, IOrganisation, IOrganisationClass } from './schemas/Organisation.schema'
import { MessageSchema, IMessage, IMessageClass } from './schemas/Message.schema'
import { AuthCodeSchema, IAuthCode, IAuthCodeClass } from './schemas/AuthCode.schema'

import { IMember } from './schemas/Member.schema'
import { IMessageAttempt } from './schemas/MessageAttempt.schema'

export {
  IUser,
  IUserClass,
  IOrganisation,
  IOrganisationClass,
  IAuthCode,
  IAuthCodeClass,
  IMessage,
  IMessageClass,
  IMember,
  IMessageAttempt
}

export type IMemberWithUser = IMember & {
  user: IUser
}

export type IOrganisationWithUsers = IOrganisation & {
  members: Types.DocumentArray<IMemberWithUser>
}

export interface IModelSet {
  User: IUserClass
  Organisation: IOrganisationClass
  Message: Model<IMessage>
  AuthCode: IAuthCodeClass
}

export function makeModels (connection: Connection): IModelSet {
  return {
    User: connection.model<IUser, IUserClass>(
      'User', UserSchema
    ),
    Organisation: connection.model<IOrganisation, IOrganisationClass>(
      'Organisation', OrganisationSchema
    ),
    Message: connection.model<IMessage>(
      'Message', MessageSchema
    ),
    AuthCode: connection.model<IAuthCode, IAuthCodeClass>(
      'AuthCode', AuthCodeSchema
    )
  }
}

// export namespace Model {
//   export interface User extends IUserClass {}
//   export interface Organisation extends Model<IOrganisation> {}
//   export interface Message extends Model<IMessage> {}
//   export interface AuthCode extends IAuthCodeClass {}
// }
