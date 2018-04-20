import { model, Model } from 'mongoose'

import { UserSchema, IUser, IUserClass } from './schemas/User.schema'
import { OrganisationSchema, IOrganisation, IOrganisationClass } from './schemas/Organisation.schema'
import { MessageSchema, IMessage, IMessageClass } from './schemas/Message.schema'
import { AuthCodeSchema, IAuthCode, IAuthCodeClass } from './schemas/AuthCode.schema'
import { IMember } from './schemas/Member.schema'

export {
  IUserClass, IOrganisationClass, IAuthCodeClass, IMessageClass, IMember
}

export interface IModelSet {
  User: IUserClass
  Organisation: IOrganisationClass
  Message: Model<IMessage>
  AuthCode: IAuthCodeClass
}

export function makeModels (): IModelSet {
  return {
    User: model<IUser, IUserClass>('User', UserSchema),
    Organisation: model<IOrganisation, IOrganisationClass>('Organisation', OrganisationSchema),
    Message: model<IMessage>('Message', MessageSchema),
    AuthCode: model<IAuthCode, IAuthCodeClass>('AuthCode', AuthCodeSchema)
  }
}

// export namespace Model {
//   export interface User extends IUserClass {}
//   export interface Organisation extends Model<IOrganisation> {}
//   export interface Message extends Model<IMessage> {}
//   export interface AuthCode extends IAuthCodeClass {}
// }
