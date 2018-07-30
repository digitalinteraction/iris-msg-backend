import { applyMiddleware, applyRoutes, applyErrorHandler } from '../router'
import * as tst from '../../tools/testHarness'
import { IModelSet } from '../models'
import { DebugI18n } from '../i18n'
import { sign } from 'jsonwebtoken'
import supertest = require('supertest')
import express = require('express')
import expressJwt = require('express-jwt')

const expectedRoutes = [
  { method: 'get', url: '/' },
  { method: 'get', url: '/health' },
  { method: 'get', url: '/.well-known/assetlinks.json' },
  { method: 'get', url: '/docs' },
  { method: 'get', url: '/open/invite/:mem_jwt' },
  { method: 'get', url: '/open/donate' },
  
  { method: 'get', url: '/users/me' },
  { method: 'post', url: '/users/login/request' },
  { method: 'post', url: '/users/login/check' },
  { method: 'post', url: '/users/update_fcm' },
  
  { method: 'get', url: '/organisations' },
  { method: 'get', url: '/organisations/:org_id', auth: true },
  { method: 'post', url: '/organisations' },
  { method: 'del', url: '/organisations/:org_id' },
  
  { method: 'post', url: '/organisations/:org_id/members' },
  { method: 'del', url: '/organisations/:org_id/members/:mem_id' },
  { method: 'post', url: '/accept/:mem_jwt' },
  { method: 'get', url: '/unsub/:mem_jwt' },
  { method: 'get', url: '/invite/:mem_jwt' },
  
  { method: 'post', url: '/messages' },
  { method: 'get', url: '/messages/attempts' },
  { method: 'post', url: '/messages/attempts' }
]

type Replacements = { [id: string]: string }

function processUrl (url: string, replacements: Replacements): string {
  for (let varName in replacements) {
    url = url.replace(new RegExp(`:${varName}`), replacements[varName])
  }
  return url
}

describe('Routing', () => {
  
  let app: express.Express
  let agent: supertest.SuperTest<supertest.Test>
  let db: any
  let models: IModelSet
  let seed: any
  let replacements: Replacements
  
  beforeEach(async () => {
    ({ db, models } = await tst.openDb())
    app = express()
    seed = await tst.applySeed('test/router', models)
    let i18n = new DebugI18n()
    let log = tst.mockLog()
    applyMiddleware(app, log)
    applyRoutes(app, models, i18n, log)
    applyErrorHandler(app, i18n, log)
    agent = supertest.agent(app)
    replacements = {
      org_id: seed.Organisation.a.id,
      mem_id: 'a_dummy_id',
      mem_jwt: sign(
        { mem: 'a_dummy_id', org: seed.Organisation.a.id },
        process.env.JWT_SECRET!
      )
    }
  })
  
  afterEach(async () => {
    await tst.closeDb(db)
  })
  
  expectedRoutes.forEach(({ method = 'get', url, auth = false }) => {
    it(`${method.toUpperCase()}: ${url}`, async () => {
      let req = (agent as any)[method](processUrl(url, replacements))
      if (auth) {
        req.set(tst.jwtHeader(seed.User.verified.id))
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
  let i18n = new DebugI18n()
  let log = tst.mockLog()
  
  beforeEach(async () => {
    app = express()
    applyMiddleware(app, log)
    app.get('/', (req, res, next) => {
      next(failer())
    })
    applyErrorHandler(app, i18n, log)
    agent = supertest.agent(app)
  })
  
  it('should convert a Set to messages', async () => {
    failer = () => new Set([ 'a', 'b', 'c' ])
    let res = await agent.get('/')
    expect(res.body.meta.codes).toEqual([ 'a', 'b', 'c' ])
  })
  it('should convert a String to messages', async () => {
    failer = () => 'error'
    let res = await agent.get('/')
    expect(res.body.meta.codes).toEqual([ 'error' ])
  })
  it('should convert a JWTUnauthorizedError to messages', async () => {
    failer = () => new expressJwt.UnauthorizedError(
      'revoked_token', { message: 'error' }
    )
    let res = await agent.get('/')
    expect(res.status).toBe(401)
    expect(res.body.meta.codes).toEqual([ 'jwt.revoked_token' ])
  })
  it('should convert an Error to messages', async () => {
    failer = () => new Error('error')
    let res = await agent.get('/')
    expect(res.body.meta.codes).toEqual([ 'error' ])
  })
  it('should default to an unknown error', async () => {
    failer = () => 7
    let res = await agent.get('/')
    expect(res.body.meta.codes).toEqual([ 'api.general.unknown' ])
  })
})
