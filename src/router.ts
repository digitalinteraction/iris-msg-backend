import express = require('express')
import bodyParser = require('body-parser')
import expressJwt = require('express-jwt')
import { RouteContext } from './types'
import { Api } from 'api-formatter'
import * as routes from './routes'
import { IModelSet } from './models'
import * as middleware from './middleware'

type CustomRoute = (ctx: RouteContext) => Promise<void>
type ExpressRoute = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => void

export function makeRoute (route: CustomRoute, models: IModelSet): ExpressRoute {
  return async (req, res, next) => {
    try {
      let api = (req as any).api as Api
      let authJwt = (req as any).user
      await route({ models, req, res, next, api, authJwt })
    } catch (error) {
      next(error)
    }
  }
}

export function applyMiddleware (app: express.Application) {
  app.use(bodyParser.json())
  app.use(middleware.api())
}

export function applyRoutes (app: express.Application, models: IModelSet) {
  
  const r = (route: CustomRoute) => makeRoute(route, models)
  
  // Reusable middleware
  let requiredJwt = middleware.jwt()
  let optionalJwt = middleware.jwt({ credentialsRequired: false })
  
  // General
  app.get('/', r(routes.general.hello))
  app.use('/docs', express.static('docs'))
  
  // Auth
  app.get('/users/me', optionalJwt, r(routes.auth.me))
  app.post('/users/login/request', optionalJwt, r(routes.auth.loginRequest))
  app.post('/users/login/check', optionalJwt, r(routes.auth.loginCheck))
  app.post('/users/update_fcm', requiredJwt, r(routes.auth.updateFcm))
  
  // Org Management
  app.get('/organisations', requiredJwt, r(routes.orgs.index))
  app.get('/organisations/:org_id', requiredJwt, r(routes.orgs.show))
  app.post('/organisations', requiredJwt, r(routes.orgs.create))
  app.delete('/organisations/:org_id', requiredJwt, r(routes.orgs.destroy))
  
  // Org Members
  app.post('/organisations/:org_id/members', requiredJwt, r(routes.members.create))
  app.delete('/organisations/:org_id/members/:mem_id', requiredJwt, r(routes.members.destroy))
  app.post('/organisations/accept/:mem_id', r(routes.members.accept))
  app.get('/unsub/:mem_id', r(routes.members.unsubscribe))
  app.get('/invite/:mem_id', r(routes.members.deepLink))
  
  // Messaging
  app.post('/messages', requiredJwt, r(routes.messages.create))
  app.get('/messages/attempts', requiredJwt, r(routes.messages.attemptsIndex))
  app.post('/messages/attempts', requiredJwt, r(routes.messages.attemptsUpdate))
}

export function applyErrorHandler (app: express.Application) {
  
  app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    let api = (req as any).api as Api
    
    if (error instanceof Set) {
      return api.sendFail(Array.from(error))
    }
    if (Array.isArray(error) || typeof error === 'string') {
      return api.sendFail(error)
    }
    if (error instanceof expressJwt.UnauthorizedError) {
      return api.sendFail(`jwt.${error.code}`, 401)
    }
    if (error instanceof Error && api) {
      return api.sendFail(error.message, 400)
    }
    
    // winston.error(error) ?
    
    return api.sendFail('api.general.unknown')
  })
}
