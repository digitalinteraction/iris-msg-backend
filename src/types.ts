import { IModelSet } from './models'
import { Api } from 'api-formatter'
import { Request, Response, NextFunction } from 'express'

export interface RouteContext {
  models: IModelSet
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
  usr: String,
  num: String
}

export const AllAuthCodeTypes = Object.values(AuthCodeType)

export enum MemberRole {
  Coordinator = 'coordinator',
  Donor = 'donor',
  Subscriber = 'subscriber'
}

export const AllMemberRoles = Object.values(MemberRole)
