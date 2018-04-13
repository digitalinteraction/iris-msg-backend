import { Model, Document } from 'mongoose'
import { resolve } from 'path'
import { safeLoad } from 'js-yaml'
import { readFile } from 'fs-extra'

export type Seed = {
  [modelName: string]: {
    [id: string]: any
  }
}

export type ModelMap = {
  [modelName: string]: Model<Document>
}

export async function applySeed (seedName: String, models: ModelMap) {
  let path = resolve(__dirname, `../seeds/${seedName}.yml`)
  let seed = safeLoad(String(await readFile(path)))
  
  if (!seed) throw new Error('Invalid Seed')
  
  let output: any = {}
  await Promise.all(Object.entries(seed).map(async ([modelName, data]) => {
    if (!models[modelName]) {
      throw new Error(`Invalid model in seed '${modelName}'`)
    } else {
      output[modelName] = await seedModel(models[modelName], data)
    }
  }))
  
  return output
}

function clearModels (models: ModelMap) {
  return Promise.all(Object.values(models).map(m =>
    m.remove({})
  ))
}

async function seedModel (Model: Model<Document>, data: any): Promise<any> {
  let names = Object.keys(data)
  let documents = Object.values(data)
  
  let models = await Model.insertMany(documents)
  
  let keyedModels: any = {}
  models.forEach((model, index) => {
    keyedModels[names[index]] = model
  })
  
  return keyedModels
}
