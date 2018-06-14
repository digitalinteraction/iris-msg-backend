import { RouteContext } from '@/src/types'

// function makeError (name: string) {
//   return `api.messages.attempts_index.${name}`
// }

export default async ({ req, api, next, models }: RouteContext) => {
  api.sendData('ok')
}
