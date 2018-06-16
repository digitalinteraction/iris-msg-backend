import { applySeed, mockRoute, Agent, openDb, closeDb } from '@/tools/testHarness'
import loginRequest from '../loginRequest.route'
import { IModelSet } from '@/src/models'
import twilio = require('twilio')

jest.mock('twilio')

let db: any
let models: IModelSet
// let seed: Seed
let agent: Agent
let sentMessages: any[]

beforeEach(async () => {
  ({ db, models } = await openDb())
  await applySeed('test/auth', models)
  agent = mockRoute(loginRequest, models)
  sentMessages = (twilio as any)().__resetMessages()
})

afterEach(async () => {
  await closeDb(db)
})

describe('auth.login.request', () => {
  it('should create an auth code', async () => {
    await agent.post('/')
      .send({ phoneNumber: '07880123001', locale: 'GB' })
    let code = await models.AuthCode.findOne()
    expect(code).toBeTruthy()
  })
  
  it('should send an sms', async () => {
    await agent.post('/')
      .send({ phoneNumber: '07880123001', locale: 'GB' })
    expect(sentMessages).toHaveLength(1)
  })
  
  it('should format the code', async () => {
    await agent.post('/')
      .send({ phoneNumber: '07880123001', locale: 'GB' })
    expect(sentMessages[0].body).toMatch(/\d{3}-\d{3}/)
  })
  
  it('should create an unverified user', async () => {
    await agent.post('/')
      .send({ phoneNumber: '07880123003', locale: 'GB' })
    let user = await models.User.findOne({ phoneNumber: '+447880123003' })
    expect(user).toBeInstanceOf(models.User)
    expect(user!.verifiedOn).toBeNull()
    expect(sentMessages).toHaveLength(1)
  })
})
