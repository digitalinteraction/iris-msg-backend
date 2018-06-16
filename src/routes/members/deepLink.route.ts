import { RouteContext } from '@/src/types'

function makeError (name: string) {
  return `api.members.deep_link.${name}`
}

export default async ({ req, api, next, models }: RouteContext) => {
  // TODO: ...
  api.sendData('ok')
}
