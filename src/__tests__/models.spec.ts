import * as models from '../models'

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
