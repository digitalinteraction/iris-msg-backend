import { applySeed, Seed, mockRoute, Agent, openDb, closeDb, jwtHeader } from '../../../../tools/testHarness'
import updateFcm from '../updateFcm.route'
import * as models from '../../../models'

let db: any
let seed: Seed
let agent: Agent

beforeEach(async () => {
  db = await openDb()
  seed = await applySeed('test/auth', models)
  agent = mockRoute(updateFcm, models, { jwt: true })
})

afterEach(async () => {
  await closeDb(db)
})

describe('auth.update-fcm', () => {
  it('should update their fcm', async () => {
    let res = await agent.post('/')
      .set(jwtHeader(seed.User.verified.id))
      .send({ newToken: 'abcdefg-123456' })
    let user = await models.User.findById(seed.User.verified.id)
    expect(user).toHaveProperty('fcmToken', 'abcdefg-123456')
  })
  it('should fail if the user is not verified', async () => {
    let res = await agent.post('/')
      .set(jwtHeader(seed.User.unverified.id))
      .send({ newToken: 'abcdefg-123456' })
    expect(res.status).toBe(400)
  })
})