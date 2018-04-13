import { applySeed, Seed, mockRoute, Agent, openDb, closeDb, jwtHeader } from '../../../../tools/testHarness'
import me from '../me.route'
import * as models from '../../../models'
import { Mongoose } from 'mongoose'

let db: Mongoose
let seed: Seed
let agent: Agent

beforeEach(async () => {
  db = await openDb()
  seed = await applySeed('test/auth/me', models)
  agent = mockRoute(me, { jwt: false })
})

afterEach(async () => {
  await closeDb(db)
})

describe('auth.verify.me', () => {
  it('should return a 200', async () => {
    let res = await agent.get('/')
    expect(res.status).toBe(200)
  })
  it('should return a user from a jwt', async () => {
    let res = await agent.get('/')
      .set(jwtHeader(seed.User.verified.id))
    expect(res.body.data).toBeTruthy()
    expect(res.body.data._id).toBe(seed.User.verified.id.toString())
  })
})
