import { Model } from 'mongoose'
import * as models from '../models'
import { applySeed } from '../../tools/seeder'

import { IUser } from '../schemas/User.schema'

beforeAll(async () => {
  let data = await applySeed('test')
  console.log(data)
})

describe('Models', () => {
  describe('User', () => {
    it('should exist', async () => {
      expect(models.User).toBeDefined()
    })
  })
  describe('Organisation', () => {
    it('should exist', async () => {
      expect(models.Organisation).toBeDefined()
    })
  })
  describe('Message', () => {
    it('should exist', async () => {
      expect(models.Message).toBeDefined()
    })
  })
  describe('AuthCode', () => {
    it('should exist', async () => {
      expect(models.AuthCode).toBeDefined()
    })
  })
})
