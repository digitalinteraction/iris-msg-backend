// import { Request, Response, NextFunction } from 'express'
//
// export type Route = function (req: Request, res: Response, next: NextFunction): void

import * as models from './models'
import { Api } from 'api-formatter'

export interface RouteContext {
  models: typeof models
  api: Api
}
