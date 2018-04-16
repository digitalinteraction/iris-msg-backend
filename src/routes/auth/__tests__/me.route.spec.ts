import { applySeed, Seed, mockRoute, Agent, openDb, closeDb, jwtHeader } from '../../../../tools/testHarness'
import me from '../me.route'
import * as models from '../../../models'
import { Mongoose } from 'mongoose'

describe('auth.me', () => {
  let db: Mongoose
  let seed: Seed
  let agent: Agent

  beforeEach(async () => {
    db = await openDb()
    seed = await applySeed('test/auth', models)
    agent = mockRoute(me, models, { jwt: false })
  })
  afterEach(async () => {
    await closeDb(db)
  })
  
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
  it('should not return unverified users', async () => {
    let res = await agent.get('/')
      .set(jwtHeader(seed.User.unverified.id))
    expect(res.body.data).toBeNull()
  })
})
