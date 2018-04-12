import { applySeed, Seed, mockRoute, Agent, openDb, closeDb } from '../../../../tools/testHarness'
import * as models from '../../../models'
import { Mongoose } from 'mongoose'

let db: Mongoose
let seed: Seed
beforeEach(async () => {
  db = await openDb()
  seed = await applySeed('test/verify-request', models)
})

afterEach(async () => {
  await closeDb(db)
})

describe('auth.verify.check', () => {
  it.skip('should pass', async () => {
    let users = await models.User.find()
    console.log('LENGTH', users.length)
  })
})
