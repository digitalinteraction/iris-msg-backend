import * as models from './models'
import { Api } from 'api-formatter'
import { Request, Response, NextFunction } from 'express'
import { Model } from 'mongoose'

export interface RouteContext {
  models: typeof models
  api: Api
  req: Request
  res: Response
  next: NextFunction
}

export enum AuthCodeType {
  Verify = 'verify',
  Login = 'login',
  Web = 'web'
}

export enum MemberRole {
  Coordinator = 'coordinator',
  Donor = 'donor',
  Subscriber = 'subscriber'
}
