import { applyMiddleware, applyRoutes } from '../router'
import * as supertest from 'supertest'
import * as express from 'express'

const expectedRoutes = [
  { method: 'get', url: '/users/me' },
  { method: 'post', url: '/users/login-request' },
  { method: 'post', url: '/users/login-check' },
  { method: 'post', url: '/users/verify-request' },
  { method: 'post', url: '/users/verify-check' },
  { method: 'post', url: '/users/update-fcm' }
  
  // { method: 'get', url: '/organisations' },
  // { method: 'get', url: '/organisations/1' },
  // { method: 'post', url: '/organisations' },
  // { method: 'del', url: '/organisations/1' },
  // { method: 'get', url: '/organisations/1/donors' },
  // { method: 'get', url: '/organisations/1/subscribers' }
]

describe('Routing', () => {
  
  let app: express.Express
  let agent: supertest.SuperTest<supertest.Test>
  beforeEach(async () => {
    app = express()
    applyMiddleware(app)
    applyRoutes(app)
    agent = supertest.agent(app)
  })
  
  expectedRoutes.forEach(({ method = 'get', url }) => {
    describe(`${method.toUpperCase()}: ${url}`, () => {
      it('should exist', async () => {
        let { statusCode } = await (agent as any)[method](url)
        expect(statusCode).not.toBe(404)
      })
    })
  })
  
})
