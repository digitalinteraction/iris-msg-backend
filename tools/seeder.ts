import * as mongoose from 'mongoose'
import { resolve } from 'path'
import { safeLoad } from 'js-yaml'
import { readFile } from 'fs-extra'

export async function applySeed (seedName: String) {
  let path = resolve(__dirname, `../seeds/${seedName}.yml`)
  let seed = safeLoad(String(await readFile(path)))
  
  if (!seed) throw new Error('Invalid Seed')
  
  let output: any = {}
  
  // await Promise.all(Object.entries(seed).map(async ([modelName, seedData]) => ))
  
  console.log('A')
  console.log(Object.entries(seed))
  
  let promises = Object.entries(seed).map(async (entry) => {
    const [modelName, data] = entry
    output[modelName] = await processSeed(modelName, data)
  })
  
  console.log(promises)
  
  await Promise.all(promises)
  
  console.log(output)
  
  return output
}

export async function processSeed (modelName: string, data: any): Promise<any> {
  let Model = mongoose.model(modelName)
  
  if (!Model) throw new Error(`Invalid model in seed '${modelName}'`)
  
  let names = Object.keys(data)
  let documents = Object.values(data)
  
  let models = await Model.insertMany(documents)
  
  console.log(models)
  
  let keyedModels: any = {}
  
  models.forEach((model, index) => {
    keyedModels[names[index]] = model
  })
  
  return keyedModels
}
