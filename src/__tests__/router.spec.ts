import { applyMiddleware, applyRoutes, applyErrorHandler } from '../router'
import { openDb, closeDb, applySeed, jwtHeader } from '../../tools/testHarness'
import * as models from '../models'
import * as supertest from 'supertest'
import * as express from 'express'

const expectedRoutes = [
  { method: 'get', url: '/users/me' },
  { method: 'post', url: '/users/login-request' },
  { method: 'post', url: '/users/login-check' },
  { method: 'post', url: '/users/verify-request' },
  { method: 'post', url: '/users/verify-check' },
  { method: 'post', url: '/users/update-fcm' },
  
  { method: 'get', url: '/organisations' },
  { method: 'get', url: '/organisations/{{org_id}}', auth: true },
  { method: 'post', url: '/organisations' },
  { method: 'del', url: '/organisations/{{org_id}}' }
]

type Replacements = { [id: string]: string }

function processUrl (url: string, replacements: Replacements): string {
  for (let varName in replacements) {
    url = url.replace(new RegExp(`{{${varName}}}`), replacements[varName])
  }
  return url
}

describe('Routing', () => {
  
  let app: express.Express
  let agent: supertest.SuperTest<supertest.Test>
  let db: any
  let seed: any
  let replacements: any
  
  beforeEach(async () => {
    db = await openDb()
    app = express()
    seed = await applySeed('test/router', models)
    applyMiddleware(app)
    applyRoutes(app)
    applyErrorHandler(app)
    agent = supertest.agent(app)
    replacements = {
      org_id: seed.Organisation.a.id
    }
  })
  
  afterEach(async () => {
    await closeDb(db)
  })
  
  expectedRoutes.forEach(({ method = 'get', url, auth = false }) => {
    it(`${method.toUpperCase()}: ${url}`, async () => {
      let req = (agent as any)[method](processUrl(url, replacements))
      if (auth) {
        req.set(jwtHeader(seed.User.verified.id))
      }
      let res = await req
      expect(res.status).not.toBe(404)
      expect(res.status).not.toBe(500)
    })
  })
  
})
