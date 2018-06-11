import { Application, Request, Response, NextFunction, Router } from 'express'
import bodyParser = require('body-parser')
import expressJwt = require('express-jwt')
import { RouteContext } from './types'
import { Api } from 'api-formatter'
import * as routes from './routes'
import { IModelSet, makeModels } from './models'
import * as middleware from './middleware'

type CustomRoute = (ctx: RouteContext) => Promise<void>
type ExpressRoute = (req: Request, res: Response, next: NextFunction) => void

export function makeRoute (route: CustomRoute, models: IModelSet): ExpressRoute {
  return async (req, res, next) => {
    try {
      await route({ models, req, res, next, api: req.api })
    } catch (error) {
      next(error)
    }
  }
}

export function applyMiddleware (app: Application) {
  app.use(bodyParser.json())
  app.use(middleware.api())
}

export function applyRoutes (app: Application) {
  
  let models = makeModels()
  const r = (route: CustomRoute) => makeRoute(route, models)
  
  // Reusable middleware
  let requiredJwt = middleware.jwt()
  let optionalJwt = middleware.jwt({ credentialsRequired: false })
  
  // General
  app.get('/', routes.general.hello)
  
  // Auth
  app.get('/users/me', optionalJwt, r(routes.auth.me))
  app.post('/users/login-request', optionalJwt, r(routes.auth.loginRequest))
  app.post('/users/login-check', optionalJwt, r(routes.auth.loginCheck))
  app.post('/users/verify-request', optionalJwt, r(routes.auth.verifyRequest))
  app.post('/users/verify-check', optionalJwt, r(routes.auth.verifyCheck))
  app.post('/users/update-fcm', requiredJwt, r(routes.auth.updateFcm))
  
  // Org Management
  app.get('/organisations', requiredJwt, r(routes.orgs.index))
  app.get('/organisations/:org_id', requiredJwt, r(routes.orgs.show))
  app.post('/organisations', requiredJwt, r(routes.orgs.create))
  app.delete('/organisations/:org_id', requiredJwt, r(routes.orgs.destroy))
  
  // Org Members
  app.post('/organisations/:org_id/members', requiredJwt, r(routes.orgs.members.invite))
  
  // Messaging
}

export function applyErrorHandler (app: Application) {
  
  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof Set) {
      return res.api.sendFail(Array.from(error))
    }
    if (Array.isArray(error) || typeof error === 'string') {
      return res.api.sendFail(error)
    }
    if (error instanceof expressJwt.UnauthorizedError) {
      return res.api.sendFail(`jwt.${error.code}`, 401)
    }
    if (error instanceof Error) {
      return res.api.sendFail(error.message, 400)
    }
    return res.api.sendFail('api.general.unknown')
  })
}
