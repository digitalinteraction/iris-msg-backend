import { Mongoose, connect } from 'mongoose'
import supertest = require('supertest')
import express = require('express')
import bodyParser = require('body-parser')
import expressJwt = require('express-jwt')
import { RouteContext } from '../src/types'
import { IModelSet, makeModels } from '../src/models'
import { ModelMap } from './seeder'
import { applyMiddleware, applyErrorHandler } from '../src/router'
import { sign } from 'jsonwebtoken'

export { applySeed, Seed, ModelMap } from './seeder'

export type ExpressRoute = (req: express.Request, res: express.Response, next: express.NextFunction) => void

export type Route = (ctx: RouteContext) => Promise<void>

export type Agent = supertest.SuperTest<supertest.Test>

export interface TestDatabase {
  db: Mongoose,
  models: IModelSet
}

export interface MockRouteOptions {
  path?: string
  jwt?: boolean
}

export function mockExpressRoute (route: ExpressRoute, options: MockRouteOptions = {}): Agent {
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

export function mockRoute (route: Route, models: any, options: MockRouteOptions = {}): Agent {
  return mockExpressRoute(async (req, res, next) => {
    try {
      let api = (req as any).api
      let authJwt = req.user
      await route({
        req, res, next, models, api, authJwt
      })
    } catch (err) {
      next(err)
    }
  }, options)
}

export async function openDb (): Promise<TestDatabase> {
  let models = makeModels()
  let db = await connect(process.env.MONGO_URI)
  return { db, models }
}

export async function closeDb (db: Mongoose): Promise<void> {
  let collections = Object.values(db.connection.collections)
  await Promise.all(collections.map(c =>
    (c as any).remove({})
  ))
  await db.disconnect()
}

export function jwtHeader (userId: any) {
  let token = sign({ usr: userId }, process.env.JWT_SECRET)
  return { Authorization: `Bearer ${token}` }
}

export function inTheFuture () {
  return new Date(32535129600000)
}
