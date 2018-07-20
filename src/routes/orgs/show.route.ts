import { RouteContext, MemberRole } from '@/src/types'
import { isMongoId } from '@/src/utils'
import { IOrganisationWithUsers } from '@/src/models'

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
  if (!isMongoId(req.params.org_id)) {
    throw makeError('notFound')
  }
  
  // Check the user is verified
  let user = await models.User.findWithJwt(authJwt)
  
  if (!user) throw makeError('notFound')
  
  let result = await models.Organisation.findForUser(user.id)
    .where('_id', req.params.org_id)
    .populate('members.user', '-fcmToken')
    .limit(1)
  
  if (result.length === 0) throw makeError('notFound')
  
  let org: IOrganisationWithUsers = result[0] as any
  
  // If you aren't a coordinator, remove user records
  const isCoordinator = org.members.find(m => m.isActive && m.role === MemberRole.Coordinator)
  
  // Remove the users if not a coordinator
  if (!isCoordinator) {
    org.members.forEach(m => m.user = m.user.id)
  }
  
  api.sendData(org.toJSONWithActiveMembers())
}
