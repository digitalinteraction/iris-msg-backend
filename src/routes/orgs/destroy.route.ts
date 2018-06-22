import { RouteContext } from '@/src/types'
import { isMongoId } from '@/src/utils'

function makeError (name: string) {
  return `api.orgs.destroy.${name}`
}

/* auth:
 * - jwt
 *
 * url params:
 * - org_id
 */
export default async ({ req, api, next, models, authJwt }: RouteContext) => {
  // Fail if passed a bad mongo id
  if (!isMongoId(req.params.org_id)) {
    throw makeError('notFound')
  }
  
  // Check the user is verified
  let user = await models.User.findWithJwt(authJwt)
  
  // Fail if the user doesn't exist or isn't verified
  if (!user) throw makeError('notFound')
  
  // Find the organisation where the user is an active coordinator
  let org = await models.Organisation.findByIdForCoordinator(
    req.params.org_id, user.id
  )
  
  // Fail if the organisation wasn't found
  if (!org) throw makeError('notFound')
  
  // Set the organisation to be deleted
  org.deletedOn = new Date()
  await org.save()
  api.sendData('ok')
}
