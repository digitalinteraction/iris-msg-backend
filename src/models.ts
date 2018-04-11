import { model } from 'mongoose'

import { UserSchema, IUser } from './schemas/User.schema'
import { OrganisationSchema, IOrganisation } from './schemas/Organisation.schema'
import { MessageSchema, IMessage } from './schemas/Message.schema'
import { AuthCodeSchema, IAuthCode } from './schemas/AuthCode.schema'

export const User = model<IUser>('User', UserSchema)
export const Organisation = model<IOrganisation>('Organisation', OrganisationSchema)
export const Message = model<IMessage>('Message', MessageSchema)
export const AuthCode = model<IAuthCode>('AuthCode', AuthCodeSchema)
