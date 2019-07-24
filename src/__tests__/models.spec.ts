import { Connection, createConnection } from 'mongoose'
import { makeModels, IModelSet } from '../models'
import { mongoArgs } from '../App'

describe('#makeModels', () => {
  let connection: Connection
  let models: IModelSet
  beforeAll(async () => {
    connection = createConnection(process.env.MONGO_URI!, mongoArgs)
    models = makeModels(connection)
  })
  afterAll(async () => {
    await connection.close()
  })

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
