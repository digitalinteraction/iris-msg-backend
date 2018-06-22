import { Connection, Types } from 'mongoose'

import {
  UserSchema, IUser, IUserClass
} from './schemas/User.schema'

import {
  OrganisationSchema, IOrganisation, IOrganisationClass
} from './schemas/Organisation.schema'

import {
  MessageSchema, IMessage, IMessageClass
} from './schemas/Message.schema'

import {
  AuthCodeSchema, IAuthCode, IAuthCodeClass
} from './schemas/AuthCode.schema'

import {
  TwilioMessageSchema, ITwilioMessage, ITwilioMessageClass
} from './schemas/TwilioMessage.schema'

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
  IMessageAttempt,
  TwilioMessageSchema,
  ITwilioMessage,
  ITwilioMessageClass
}

export type IMemberWithUser = {
  user: IUser
} & IMember

export type IOrganisationWithUsers = {
  members: Types.DocumentArray<IMemberWithUser>
} & IOrganisation

export type IAuthCodeWithUser = {
  user: IUser
} & IAuthCode

export type IMessageWithOrganisation = {
  organisation: IOrganisation
} & IMessage

export interface IModelSet {
  User: IUserClass
  Organisation: IOrganisationClass
  Message: IMessageClass
  AuthCode: IAuthCodeClass
  TwilioMessage: ITwilioMessageClass
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
    ),
    TwilioMessage: connection.model<ITwilioMessage, ITwilioMessageClass>(
      'TwilioMessage', TwilioMessageSchema
    )
  }
}

// export namespace Model {
//   export interface User extends IUserClass {}
//   export interface Organisation extends Model<IOrganisation> {}
//   export interface Message extends Model<IMessage> {}
//   export interface AuthCode extends IAuthCodeClass {}
// }
