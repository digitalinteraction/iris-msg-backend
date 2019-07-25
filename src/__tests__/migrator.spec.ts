import { runMigrations } from '../migrator'
import { mongoArgs } from '../App'
import { createConnection, Connection } from 'mongoose'
import { join } from 'path'
import { mocked } from 'ts-jest/utils'

import fakeMigration = require('../__mock_migrations__/001-migration')

describe('#runMigrations', () => {
  let connection: Connection

  beforeEach(async () => {
    connection = createConnection(process.env.MONGO_URI!, mongoArgs)
    await new Promise(resolve => connection.on('connected', resolve))

    mocked(fakeMigration.exec).mockClear()
  })

  afterEach(async () => {
    await connection.dropDatabase()
    await connection.close()
  })

  it('should run the migrators', async () => {
    await runMigrations(connection, join(__dirname, '../__mock_migrations__'))

    expect(fakeMigration.exec).toBeCalled()
  })
  it('should store the run migrations in a collection', async () => {
    await runMigrations(connection, join(__dirname, '../__mock_migrations__'))

    let migrations = await connection
      .collection('_migrations')
      .find()
      .toArray()
    expect(migrations).toContainEqual({
      _id: expect.anything(),
      name: '001-migration',
      executedAt: expect.any(Date)
    })
  })
  it('should only run migrations once', async () => {
    await runMigrations(connection, join(__dirname, '../__mock_migrations__'))
    await runMigrations(connection, join(__dirname, '../__mock_migrations__'))
    await runMigrations(connection, join(__dirname, '../__mock_migrations__'))

    let migrations = await connection
      .collection('_migrations')
      .find()
      .toArray()

    expect(migrations).toHaveLength(1)
  })
})
