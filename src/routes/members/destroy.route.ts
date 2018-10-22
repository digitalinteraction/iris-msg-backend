import { RouteContext, MemberRole } from '@/src/types'
import { isMongoId } from '@/src/utils'
import { IOrganisation, IMember } from '../../models'

function makeError (name: string) {
  return `api.members.destroy.${name}`
}

const RequiredRoles = [
  MemberRole.Coordinator,
  MemberRole.Donor
]

// A member can be deleted if it belongs to the user or they are a coordinator
function canDestroy (org: IOrganisation, member: IMember, userId: string) {
  return member.user.toHexString() === userId ||
    org.isMember(userId, MemberRole.Coordinator)
}

/* auth:
 * - jwt
 *
 * url params:
 * - org_id
 * - mem_id
 */
export default async ({ req, api, models, authJwt }: RouteContext) => {
  
  if (!isMongoId(req.params.org_id) || !isMongoId(req.params.mem_id)) {
    throw makeError('notFound')
  }
  
  // Find the organisation
  let org = await models.Organisation.findById(req.params.org_id)
  if (!org) throw makeError('notFound')
  
  // Find the membership
  let member = org.members.id(req.params.mem_id)
  if (!member) throw makeError('notFound')
  
  // Fail if not their own record or they aren't a coordinator
  if (!canDestroy(org, member, authJwt!!.usr)) throw makeError('notFound')
  
  // Check for the last of role for non-subscribers
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
