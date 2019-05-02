import { RouteContext } from '@/src/types'
import mongoose from 'mongoose'

function makeError (name: string) {
  return `api.general.health.${name}`
}

export default async ({ api }: RouteContext) => {
  // Check the db connection
  if (mongoose.connection.readyState !== 1) throw makeError('noDb')
  
  // Check firebase ?
  
  // Check twilio ?
  
  api.sendData('ok')
}
