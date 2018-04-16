import { Mongoose, connect } from 'mongoose'
import supertest = require('supertest')
import express = require('express')
import bodyParser = require('body-parser')
import expressJwt = require('express-jwt')
import { RouteContext } from '../src/types'
import { ModelMap } from './seeder'
import { applyMiddleware, applyErrorHandler } from '../src/router'
import { sign } from 'jsonwebtoken'

export { applySeed, Seed, ModelMap } from './seeder'

export type Route = (req: express.Request, res: express.Response, next: express.NextFunction) => void

export type Route2 = (ctx: RouteContext) => Promise<void>

export type Agent = supertest.SuperTest<supertest.Test>

export interface MockRouteOptions {
  path?: string
  jwt?: boolean
}

export function mockExpressRoute (route: Route, options: MockRouteOptions = {}): Agent {
  let app = express()
  applyMiddleware(app)
  
  if (options.jwt !== undefined) {
    app.use(expressJwt({
      secret: process.env.JWT_SECRET,
      credentialsRequired: options.jwt
    }))
  }
  app.use(options.path || '', route)
  applyErrorHandler(app)
  return supertest.agent(app)
}

export function mockRoute (route: Route2, models: any, options: MockRouteOptions = {}): Agent {
  return mockExpressRoute(async (req, res, next) => {
    try {
      await route({
        req, res, next, models, api: req.api
      })
    } catch (err) {
      next(err)
    }
  }, options)
}

export function openDb (): Promise<Mongoose> {
  return connect(process.env.MONGO_URI)
}

export async function closeDb (db: Mongoose): Promise<void> {
  let collections = Object.values(db.connection.collections)
  await Promise.all(collections.map(collection => {
    return collection.remove({})
  }))
  await db.connection.close()
}

export function jwtHeader (userId: any) {
  let token = sign({ usr: userId }, process.env.JWT_SECRET)
  return { Authorization: `Bearer ${token}` }
}
