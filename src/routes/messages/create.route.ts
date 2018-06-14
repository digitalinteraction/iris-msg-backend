import { RouteContext } from '@/src/types'

// function makeError (name: string) {
//   return `api.messages.create.${name}`
// }

export default async ({ req, api, next, models }: RouteContext) => {
  api.sendData('ok')
}
