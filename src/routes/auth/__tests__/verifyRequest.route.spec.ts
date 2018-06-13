import { applySeed, mockRoute, Agent, openDb, closeDb } from '../../../../tools/testHarness'
import verifyRequest from '../verifyRequest.route'
import { IModelSet } from '../../../models'
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
  agent = mockRoute(verifyRequest, models)
  sentMessages = (twilio as any)().__resetMessages()
})

afterEach(async () => {
  await closeDb(db)
})

describe('auth.verify.request', () => {
  it('should create an unverified user', async () => {
    await agent.post('/')
      .send({ phoneNumber: '07880123003', locale: 'GB' })
    let users = await models.User.find()
    expect(users.length).toBe(3)
  })
  it('should format the phone number', async () => {
    await agent.post('/')
      .send({ phoneNumber: '07880123003', locale: 'GB' })
    let user = (await models.User.find())[2]
    expect(user.phoneNumber).toBe('+447880123003')
  })
  it('should create an authentication code', async () => {
    await agent.post('/')
      .send({ phoneNumber: '07880123003', locale: 'GB' })
    let codes = await models.AuthCode.find()
    expect(codes.length).toBe(1)
  })
  it('should send the authentication code', async () => {
    await agent.post('/')
      .send({ phoneNumber: '07880123003', locale: 'GB' })
    expect(sentMessages.length).toBe(1)
  })
  it('should format the authentication code', async () => {
    await agent.post('/')
      .send({ phoneNumber: '07880123003', locale: 'GB' })
    expect(sentMessages[0].body).toMatch(/\d{3}-\d{3}/)
  })
  it('should do nothing if the user exists', async () => {
    await agent.post('/')
      .send({ phoneNumber: '07880123001', locale: 'GB' })
    let users = await models.User.find()
    let codes = await models.AuthCode.find()
    expect(users).toHaveLength(2)
    expect(codes).toHaveLength(0)
    expect(sentMessages).toHaveLength(0)
  })
})
