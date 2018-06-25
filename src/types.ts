import { IModelSet } from './models'
import { LocalI18n } from './i18n'
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
  translate (locale: string, key: string, args?: LocaliseArgs): string
  // pluralise (locale: string, key: string, count: number): string
}

export interface RouteContext {
  models: IModelSet
  i18n: LocalI18n
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
  loc: string
}

export enum MemberRole {
  Coordinator = 'coordinator',
  Donor = 'donor',
  Subscriber = 'subscriber'
}

export enum MessageAttemptState {
  Pending = 'pending',
  Rejected = 'rejected',
  Failed = 'failed',
  Success = 'success',
  NoService = 'no_service',
  NoSmsData = 'no_sms_data',
  RadioOff = 'radio_off',
  Twilio = 'twilio',
  NoResponse = 'no_response'
}

export enum FcmType {
  NewDonations = 'new_donations'
}

export const AllAuthCodeTypes = Object.values(AuthCodeType)
export const AllMemberRoles = Object.values(MemberRole)
export const AllMessageAttemptStates = Object.values(MessageAttemptState)
export const AllFcmTypes = Object.values(FcmType)
