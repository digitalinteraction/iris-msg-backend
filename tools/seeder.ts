import { Model, Document } from 'mongoose'
import { resolve } from 'path'
import { safeLoad } from 'js-yaml'
import * as models from '../src/models'
import fs from 'fs'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)

type NamedType<T> = { [name: string]: T }

export type Seed = {
  User: NamedType<models.IUser>
  Organisation: NamedType<models.IOrganisation>
  Message: NamedType<models.IMessage>
  AuthCode: NamedType<models.IAuthCode>
  TwilioMessage: NamedType<models.ITwilioMessage>
}

export async function applySeed(seedName: String, models: models.IModelSet) {
  let path = resolve(__dirname, `../seeds/${seedName}.yml`)
  let data = await readFile(path, 'utf8')
  let seed = safeLoad(data)

  if (!seed) throw new Error('Invalid Seed')

  let output: any = {}

  await Promise.all(
    Object.entries(seed).map(async ([modelName, data]) => {
      if (!(models as any)[modelName]) {
        throw new Error(`Invalid model in seed '${modelName}'`)
      } else {
        output[modelName] = await seedModel((models as any)[modelName], data)
      }
    })
  )

  return output
}

async function seedModel(Model: Model<Document>, data: any): Promise<any> {
  let names = Object.keys(data)
  let documents = Object.values(data)

  let models = await Model.insertMany(documents)

  let keyedModels: any = {}
  for (let index in models) {
    let model = models[index]
    keyedModels[names[index]] = model
  }

  return keyedModels
}
