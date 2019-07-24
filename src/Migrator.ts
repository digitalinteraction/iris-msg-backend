import mongoose from 'mongoose'
import fs from 'fs'
import { join } from 'path'
import { MigrateContext } from './types'
import { makeModels } from './models'

export type Migrator = {
  name: string
  exec: (ctx: MigrateContext) => Promise<void>
}

export const migrationTable = '_migrations'
export const isMigration = /\.(?:js|ts)$/

export async function runMigrations(
  connection: mongoose.Connection,
  directory: string
) {
  // Get the migrations that have been ran
  const migrations = await connection
    .collection(migrationTable)
    .find()
    .toArray()

  // Find the migrations in the directory specified
  // - Filter out non-js files
  // - Make sure they haven't been run before
  // - Convert them to a migrator ({ name, exec })
  // - Filter out ones without an exec method
  let migrators: Migrator[] = fs
    .readdirSync(directory)
    .filter(name => name.match(isMigration))
    .map(name => name.replace(isMigration, ''))
    .filter(name => !migrations.includes((record: any) => record.name === name))
    .map(name => ({ name, ...require(join(directory, name)) }))
    .filter(migrator => typeof migrator.exec === 'function')

  if (migrators.length === 0) return []

  // Create models for the migrators
  const models = makeModels(connection)

  // Run the migrations in series
  for (const migrator of migrators) await migrator.exec({ models })

  // Add migration records to remember what was done
  await connection
    .collection(migrationTable)
    .insertMany(migrators.map(m => ({ name: m.name, executedAt: new Date() })))

  // Return the migrations that were run
  return migrators.map(m => m.name)
}
