import { Application, Request, Response, NextFunction, Router } from 'express'
import bodyParser = require('body-parser')
import expressJwt = require('express-jwt')
import * as routes from './routes'
import * as middleware from './middleware'

export function applyMiddleware (app: Application) {
  app.use(bodyParser.json())
  app.use(middleware.api())
}

export function applyRoutes (app: Application) {
  
  // Reusable middleware
  let requiredJwt = middleware.jwt()
  let optionalJwt = middleware.jwt({ credentialsRequired: false })
  
  // General
  app.get('/', routes.general.hello)
  
  // Auth
  app.get('/users/me', optionalJwt, routes.auth.me)
  app.post('/users/login-request', optionalJwt, routes.auth.loginRequest)
  app.post('/users/login-check', optionalJwt, routes.auth.loginCheck)
  app.post('/users/verify-request', optionalJwt, routes.auth.verifyRequest)
  app.post('/users/verify-check', optionalJwt, routes.auth.verifyCheck)
  app.post('/users/update-fcm', requiredJwt, routes.auth.updateFcm)
  
  // Org Management
  
  // Org Members
  
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
      return res.api.sendFail('auth failed', 401)
    }
    if (error instanceof Error) {
      return res.api.sendFail(error.message, 400)
    }
    return res.api.sendFail('api.general.unknown')
  })
}
