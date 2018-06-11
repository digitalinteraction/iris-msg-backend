import { applyMiddleware, applyRoutes, applyErrorHandler } from '../router'
import { openDb, closeDb, applySeed, jwtHeader } from '../../tools/testHarness'
import { IModelSet } from '../models'
import supertest = require('supertest')
import express = require('express')
import expressJwt = require('express-jwt')

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
  let models: IModelSet
  let seed: any
  let replacements: any
  
  beforeEach(async () => {
    ({ db, models } = await openDb())
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

describe('#applyErrorHandler', () => {
  let app: express.Express
  let agent: supertest.SuperTest<supertest.Test>
  let failer: () => void
  
  beforeEach(async () => {
    app = express()
    applyMiddleware(app)
    app.get('/', (req, res, next) => {
      next(failer())
    })
    applyErrorHandler(app)
    agent = supertest.agent(app)
  })
  
  it('should convert a Set to messages', async () => {
    failer = () => new Set([ 'a', 'b', 'c' ])
    let res = await agent.get('/')
    expect(res.body.meta.messages).toEqual([ 'a', 'b', 'c' ])
  })
  it('should convert a String to messages', async () => {
    failer = () => 'error'
    let res = await agent.get('/')
    expect(res.body.meta.messages).toEqual([ 'error' ])
  })
  it('should convert a JWTUnauthorizedError to messages', async () => {
    failer = () => new expressJwt.UnauthorizedError(
      'revoked_token', { message: 'error' }
    )
    let res = await agent.get('/')
    expect(res.status).toBe(401)
    expect(res.body.meta.messages).toEqual([ 'jwt.revoked_token' ])
  })
  it('should convert an Error to messages', async () => {
    failer = () => new Error('error')
    let res = await agent.get('/')
    expect(res.body.meta.messages).toEqual([ 'error' ])
  })
  it('should default to an unknown error', async () => {
    failer = () => 7
    let res = await agent.get('/')
    expect(res.body.meta.messages).toEqual([ 'api.general.unknown' ])
  })
})
