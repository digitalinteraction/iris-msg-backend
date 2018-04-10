import { Api, IApiOptions } from 'api-formatter'
import { Request, Response, NextFunction } from 'express'

export default function (options: IApiOptions = {}) {
  return Api.middleware({ ...options, name: 'iris-msg-api' })
}

declare global {
  namespace Express {
    export interface Request {
      api: Api
    }
    export interface Response {
      api: Api
    }
  }
}
