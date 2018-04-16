import { applySeed, Seed, mockRoute, Agent, openDb, closeDb } from '../../../../tools/testHarness'
import loginCheck from '../loginCheck.route'
import * as models from '../../../models'
import { AuthCodeType } from '../../../types'
import { verify } from 'jsonwebtoken'

let db: any
let seed: Seed
let agent: Agent

beforeEach(async () => {
  db = await openDb()
  seed = await applySeed('test/auth', models)
  agent = mockRoute(loginCheck, models)
  
  await models.AuthCode.create({
    code: 123456,
    expiresOn: new Date(Date.UTC(5000, 0)),
    usedOn: null,
    user: seed.User.verified.id,
    type: AuthCodeType.Login
  })
})

afterEach(async () => {
  await closeDb(db)
})

describe('auth.login.check', () => {
  it('should return a 200', async () => {
    let res = await agent.post('/').send({ code: 123456 })
    expect(res.status).toBe(200)
  })
  it('should return the user', async () => {
    let res = await agent.post('/').send({ code: 123456 })
    let user = res.body.data.user
    expect(user._id).toEqual(seed.User.verified.id)
  })
  it('should return a jwt', async () => {
    let res = await agent.post('/').send({ code: 123456 })
    let payload = verify(res.body.data.token, process.env.JWT_SECRET) as any
    expect(payload.usr).toBe(seed.User.verified.id)
  })
  it('should fail if the code has expired', async () => {
    let oldCode = await models.AuthCode.create({
      code: 654321,
      expiresOn: new Date(Date.UTC(1000, 0)),
      usedOn: null,
      user: seed.User.verified.id
    })
    let res = await agent.post('/').send({ code: 654321 })
    expect(res.status).toBe(400)
  })
})
