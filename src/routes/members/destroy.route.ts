import { RouteContext, MemberRole } from '@/src/types'
import { isMongoId } from '@/src/utils'

function makeError (name: string) {
  return `api.members.destroy.${name}`
}

const RequiredRoles = [
  MemberRole.Coordinator,
  MemberRole.Donor
]

/* auth:
 * - jwt
 *
 * url params:
 * - org_id
 * - mem_id
 */
export default async ({ req, api, models, authJwt }: RouteContext) => {
  
  if (!isMongoId(req.params.org_id) || !isMongoId(req.params.org_id)) {
    throw makeError('notFound')
  }
  
  // Find the current user
  let user = await models.User.findWithJwt(authJwt)
  if (!user) throw makeError('api.general.badAuth')
  
  // Find the organisation
  let org = await models.Organisation.findByIdForCoordinator(
    req.params.org_id, user.id
  )
  if (!org) throw makeError('notFound')
  
  // Find the membership
  let member = org.members.id(req.params.mem_id)
  if (!member) throw makeError('notFound')
  
  // Check for the last of role for non-subscribers
  // TODO: Verified check here!
  if (RequiredRoles.includes(member.role)) {
    let roleCount = org.members.reduce((sum, mem) => {
      let isSameRole = mem.role === member.role && mem.isActive
      return sum + (isSameRole ? 1 : 0)
    }, 0)
    if (roleCount <= 1) throw makeError('badDestroy')
  }
  
  // Mark the membership as deleted
  member.deletedOn = new Date()
  await org.save()
  
  // Return a success
  api.sendData('ok')
}
