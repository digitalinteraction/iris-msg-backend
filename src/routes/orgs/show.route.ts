import { RouteContext } from '@/src/types'
import { Types } from 'mongoose'

function makeError (name: string) {
  return `api.orgs.show.${name}`
}

/* auth:
 * - jwt
 *
 * url params:
 * - org_id
 */
export default async ({ req, api, next, models, authJwt }: RouteContext) => {
  // Fail for bad mongo ids
  if (!Types.ObjectId.isValid(req.params.org_id)) {
    throw makeError('notFound')
  }
  
  // Check the user is verified
  let user = await models.User.findWithJwt(authJwt)
  
  if (!user) throw makeError('notFound')
  
  let [ org ] = await models.Organisation.findForUser(user.id)
    .where('_id', req.params.org_id)
    .limit(1)
  
  if (!org) throw makeError('notFound')
  else api.sendData(org)
}
