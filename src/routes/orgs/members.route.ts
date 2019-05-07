import { RouteContext, MemberRole, AllMemberRoles } from '@/src/types'
import { IOrganisationWithUsers } from '@/src/models'

function makeError (name: string) {
  return `api.orgs.members.${name}`
}

/* auth:
 * - jwt
 * - coordinator
 *
 * params:
 * - org_id
 *
 * query:
 * - role
 */
export default async ({ req, api, models, authJwt }: RouteContext) => {
  
  // Fail if a bad role is passed
  if (req.query.role && !AllMemberRoles.includes(req.query.role)) {
    throw makeError('badRole')
  }
  
  // Get the role
  let role = req.query.role as MemberRole || null
  
  // Find the organisation and ensure the current user is an organiser
  let result = await models.Organisation.findByIdForCoordinator(
    req.params.org_id, authJwt && authJwt.usr
  ).populate('members.user')
  
  // Fail if the organisation was not found
  let org: IOrganisationWithUsers = result as any
  if (!org) throw makeError('notFound')
  
  // Filter the members which are active and in the query role (if provided)
  let members = org.members.filter(member => {
    return member.isActive &&
      (role == null || member.role === role)
  })
  
  // Send back a response
  api.sendData(members.map(m => ({
    _id: m.id,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    role: m.role,
    userId: m.user.id,
    phoneNumber: m.user.phoneNumber,
    locale: m.user.locale
  })))
}
