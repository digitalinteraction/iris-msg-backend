import { applySeed, Seed, mockRoute, Agent, openDb, closeDb, jwtHeader } from '../../../../tools/testHarness'
import updateFcm from '../updateFcm.route'
import * as models from '../../../models'
import { Mongoose } from 'mongoose'

let db: Mongoose
let seed: Seed
let agent: Agent

beforeEach(async () => {
  db = await openDb()
  seed = await applySeed('test/auth/update-fcm', models)
  agent = mockRoute(updateFcm, { jwt: true })
})

afterEach(async () => {
  await closeDb(db)
})

describe('auth.verify.me', () => {
  it('should return update their fmc', async () => {
    let res = await agent.post('/')
      .set(jwtHeader(seed.User.verified.id))
      .send({ newToken: 'abcdefg-123456' })
    let user = await models.User.findOne()
    expect(user).toHaveProperty('fcmToken', 'abcdefg-123456')
  })
})
