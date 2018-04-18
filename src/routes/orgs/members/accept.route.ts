import { RouteContext } from '../../../types'

function makeError (name: string) {
  return `api.orgs.members.accept.${name}`
}

export default async ({ req, api, next, models }: RouteContext) => {
  
  api.sendData('ok')
}
