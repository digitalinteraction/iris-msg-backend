import { RouteContext } from '@/src/types'

// function makeError (name: string) {
//   return `api.orgs.index.${name}`
// }

/* auth:
 * - jwt
 */
export default async ({ req, api, models, authJwt }: RouteContext) => {
  
  // Check the user is verified
  let user = await models.User.findWithJwt(authJwt)
  
  if (!user) return api.sendData([])
  
  api.sendData(
    await models.Organisation.findForUser(user.id)
  )
}
