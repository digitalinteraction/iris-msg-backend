import { applySeed, Seed, mockRoute, Agent, openDb, closeDb } from '../../../../tools/testHarness'
import verifyRequest from '../verifyRequest.route'
import * as express from 'express'
import * as supertest from 'supertest'
import { Mongoose } from 'mongoose'
import * as models from '../../../models'

let db: Mongoose
let seed: Seed
let agent: Agent

beforeEach(async () => {
  try {
    db = await openDb()
    seed = await applySeed('test/verify-request', models)
    agent = mockRoute(verifyRequest)
  } catch (e) { console.log(e) }
})

afterEach(async () => {
  try {
    await closeDb(db)
  } catch (e) { console.log(e) }
})

describe('auth.verify.request', () => {
  it('should create an unverified user', async () => {
    await agent.post('/')
      .send({ phoneNumber: '07880123003', locale: 'en-GB' })
    let users = await models.User.find()
    expect(users.length).toBe(3)
  })
  it.skip('should format the phone number', async () => {
    // ...
  })
  it.skip('should create an authentication code', async () => {
    // ...
  })
  it.skip('should send the authentication code', async () => {
    // ...
  })
  it.skip('should ____ if the user exists', async () => {
    // ...
  })
})
