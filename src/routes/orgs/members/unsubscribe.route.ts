import { RouteContext } from '../../../types'

// function makeError (name: string) {
//   return `api.orgs.members.unsubscribe.${name}`
// }

/* url params:
 * - mem_id ~ The id of the member to unsubscribe
 */
export default async ({ req, api, next, models }: RouteContext) => {
  api.sendData('ok')
}
