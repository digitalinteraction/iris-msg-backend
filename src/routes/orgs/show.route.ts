import { RouteContext } from '@/src/types'
import { isMongoId } from '@/src/utils'

function makeError (name: string) {
  return `api.orgs.show.${name}`
}

/* auth:
 * - jwt
 *
 * url params:
 * - org_id
 */
export default async ({ req, api, models, authJwt }: RouteContext) => {
  // Fail for bad mongo ids
  if (!isMongoId(req.params.org_id)) {
    throw makeError('notFound')
  }
  
  // Check the user is verified
  let user = await models.User.findWithJwt(authJwt)
  
  if (!user) throw makeError('notFound')
  
  let result = await models.Organisation.findForUser(user.id)
    .where('_id', req.params.org_id)
    .limit(1)
  
  // Fail if the organisation doesn't exist
  if (!result[0]) throw makeError('notFound')
  
  // Send back the formatted organisation
  api.sendData(result[0].toJSONWithActiveMembers())
}
