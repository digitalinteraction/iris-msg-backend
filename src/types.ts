import { IModelSet } from './models'
import { I18n } from './i18n'
import { Api } from 'api-formatter'
import { Request, Response, NextFunction } from 'express'
import { Document, Types } from 'mongoose'

export interface IBaseModel extends Document {
  createdAt: Date
  updatedAt: Date
}

export interface IBaseSubModel extends Types.Subdocument {
  createdAt: Date
  updatedAt: Date
}

export type LocaliseArgs = { [id: string]: any } | Array<any>

export interface ILocaliser {
  translate (locale: string, key: string, args: LocaliseArgs): string
  // pluralise (locale: string, key: string, count: number): string
}

export interface RouteContext {
  models: IModelSet
  i18n: I18n
  api: Api
  req: Request
  res: Response
  next: NextFunction,
  authJwt?: AuthJwt
}

export enum AuthCodeType {
  Verify = 'verify',
  Login = 'login',
  Web = 'web'
}

export interface AuthJwt {
  usr: string
}

export enum MemberRole {
  Coordinator = 'coordinator',
  Donor = 'donor',
  Subscriber = 'subscriber'
}

export enum MessageAttemptState {
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Failed = 'FAILED',
  Success = 'SUCCESS',
  NoService = 'NO_SERVICE',
  NoSmsData = 'NO_SMS_DATA',
  RadioOff = 'RADIO_OFF',
  Twilio = 'TWILIO',
  NoSenders = 'NO_SENDERS',
  NoResponse = 'NO_RESPONSE'
}

export enum FcmType {
  NewDonations = 'new_donations'
}

export const AllAuthCodeTypes = Object.values(AuthCodeType)
export const AllMemberRoles = Object.values(MemberRole)
export const AllMessageAttemptStates = Object.values(MessageAttemptState)
export const AllFcmTypes = Object.values(FcmType)
