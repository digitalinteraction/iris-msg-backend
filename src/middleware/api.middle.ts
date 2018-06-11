import { Api, IApiOptions } from 'api-formatter'
import { Request, Response } from 'express'

export default function (options: IApiOptions = {}) {
  return Api.middleware({ ...options, name: 'iris-msg-api' })
}
