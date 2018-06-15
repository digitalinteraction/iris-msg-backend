import { createConnection, Connection } from 'mongoose'
import supertest = require('supertest')
import express = require('express')
import expressJwt = require('express-jwt')
import { RouteContext, MemberRole } from '@/src/types'
import { IModelSet, makeModels, IOrganisation, IUser, IMember } from '../src/models'
import { applyMiddleware, applyErrorHandler } from '@/src/router'
import { sign } from 'jsonwebtoken'

export { applySeed, Seed, ModelMap } from './seeder'

export type ExpressRoute = (req: express.Request, res: express.Response, next: express.NextFunction) => void
export type Route = (ctx: RouteContext) => Promise<void>
export type Agent = supertest.SuperTest<supertest.Test>

export interface TestDatabase {
  db: any,
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
  let connection = createConnection(process.env.MONGO_URI)
  let models = makeModels(connection)
  await new Promise(resolve => connection.on('connected', resolve))
  return { db: connection, models }
}

export async function closeDb (db: Connection): Promise<void> {
  try {
    let collections = Object.values(db.collections)
    await Promise.all(collections.map(c =>
      (c as any).remove({})
    ))
    await db.close(true)
    clean(db, 'models')
    clean(db, 'modelSchemas')
  } catch (err) {
    console.log('#closeDb', err)
  }
}

export function jwtHeader (userId: any) {
  let token = sign({ usr: userId }, process.env.JWT_SECRET)
  return { Authorization: `Bearer ${token}` }
}

export const inTheFuture = new Date(32535129600000)
export const inThePast = new Date('2013-09-25T16:00:00.1Z')

function clean (object: any, path: string) {
  for (let key in object[path]) {
    delete object[path][key]
  }
}

/*
 * Model Utilities
 */

export function addMember (
  org: IOrganisation,
  user: IUser,
  role: MemberRole,
  extras: any = {}
): IMember {
  let member = org.members.create({
    role: role,
    user: user.id,
    confirmedOn: inThePast,
    ...extras
  })
  org.members.push(member)
  return member
}
