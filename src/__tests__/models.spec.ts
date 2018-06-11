import { makeModels } from '../models'

describe('#makeModels', () => {
  let models = makeModels()
  
  it('should have the User Model', async () => {
    expect(models.User).toBeDefined()
  })
  it('should have the Organisation Model', async () => {
    expect(models.Organisation).toBeDefined()
  })
  it('should have the Message Model', async () => {
    expect(models.Message).toBeDefined()
  })
  it('should have the AuthCode Model', async () => {
    expect(models.AuthCode).toBeDefined()
  })
})
