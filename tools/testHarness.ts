import { Mongoose, connect } from 'mongoose'
import supertest = require('supertest')
import express = require('express')
import bodyParser = require('body-parser')
import expressJwt = require('express-jwt')
import { api } from '../src/middleware'
import { ModelMap } from './seeder'
import { applyMiddleware } from '../src/router'
import { sign } from 'jsonwebtoken'

export { applySeed, Seed, ModelMap } from './seeder'

export type Route = (req: express.Request, res: express.Response, next: express.NextFunction) => void

export type Agent = supertest.SuperTest<supertest.Test>

export interface MockRouteOptions {
  path?: string
  jwt?: boolean
}

export function mockRoute (route: Route, options: MockRouteOptions = {}): Agent {
  let app = express()
  applyMiddleware(app)
  
  if (options.jwt !== undefined) {
    app.use(expressJwt({
      secret: process.env.JWT_SECRET,
      credentialsRequired: options.jwt
    }))
  }
  app.use(options.path || '', route)
  return supertest.agent(app)
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
