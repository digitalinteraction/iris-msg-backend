import { Mongoose, connect } from 'mongoose'
import * as supertest from 'supertest'
import * as express from 'express'
import * as bodyParser from 'body-parser'
import { api } from '../src/middleware'
import { ModelMap } from './seeder'
import { applyMiddleware } from '../src/router'

export { applySeed, Seed, ModelMap } from './seeder'

export type Route = (req: express.Request, res: express.Response, next: express.NextFunction) => void

export type Agent = supertest.SuperTest<supertest.Test>

export function mockRoute (route: Route): Agent {
  let app = express()
  applyMiddleware(app)
  app.use(route)
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
