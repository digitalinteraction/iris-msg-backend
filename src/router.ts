import { Application, Request, Response, NextFunction, Router } from 'express'
import * as bodyParser from 'body-parser'
import { UnauthorizedError } from 'express-jwt'
import * as routes from './routes'
import * as middleware from './middleware'

export function applyMiddleware (app: Application) {
  app.use(middleware.api())
  app.use(bodyParser.json())
}

export function applyRoutes (app: Application) {
  
  // Reusable middleware
  let optionalJwt = middleware.jwt({ credentialsRequired: false })
  
  // Multi-purpose routers
  let authed = Router()
  authed.use(middleware.jwt)
  
  // General
  app.get('/', routes.general.hello)
  
  // Auth
  app.get('/users/me', optionalJwt, routes.auth.me)
  app.post('/users/login-request', optionalJwt, routes.auth.loginRequest)
  app.post('/users/login-check', optionalJwt, routes.auth.loginCheck)
  app.post('/users/verify-request', optionalJwt, routes.auth.verifyRequest)
  app.post('/users/verify-check', optionalJwt, routes.auth.verifyCheck)
  app.post('/users/update-fcm', optionalJwt, routes.auth.updateFcm)
  
  // Org Management
  
  // Org Members
  
  // Messaging
}

export function applyErrorHandler (app: Application) {
  
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    
    if (err instanceof UnauthorizedError) {
      res.api.sendFail('auth failed', 401)
      return
    }
    
    res.api.sendFail(err.message, 400)
  })
}
