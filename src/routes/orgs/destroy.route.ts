import { RouteContext } from '@/src/types'

// function makeError (name: string) {
//   return `api.orgs.destroy.${name}`
// }

/* auth:
 * - jwt
 *
 * url params:
 * - org_id
 */
export default async ({ req, api, next, models, authJwt }: RouteContext) => {
  
  // Check the user is verified
  let user = await models.User.findWithJwt(authJwt)
  
  // Fail if the user doesn't exist or isn't verified
  if (!user) throw new Error('api.general.badAuth')
  
  // Find the organisation where the user is an active coordinator
  let org = await models.Organisation.findByIdForCoordinator(
    req.params.org_id, user.id
  )
  
  // Fail if the organisation wasn't found
  if (!org) throw new Error('api.general.badAuth')
  
  // Set the organisation to be deleted
  org.deletedOn = new Date()
  await org.save()
  api.sendData('ok')
}
