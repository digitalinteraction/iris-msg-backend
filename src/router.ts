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
  
  // Multi-purpose routers
  let authed = Router()
  authed.use(middleware.jwt)
  
  // General
  app.get('/', routes.general.hello)
  
  // Auth
  app.get('/user/me', middleware.jwt({ credentialsRequired: false }), routes.auth.me)
  
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
