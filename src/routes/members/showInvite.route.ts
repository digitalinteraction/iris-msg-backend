import { RouteContext, MemberJwt } from '@/src/types'
import { isMemberJwt } from '@/src/utils'
import { verify } from 'jsonwebtoken'

function makeError (name: string) {
  return `api.members.showInvite.${name}`
}

/* url params:
 * - token
 */
export default async ({ req, api, next, models }: RouteContext) => {
  
  // Fetch the organisation for that member
  let memberJwt: MemberJwt
  try {
    memberJwt = verify(req.params.token, process.env.JWT_SECRET!) as any
  } catch (error) {
    throw makeError('notFound')
  }
  
  // Fail for invalid member jwts
  if (!isMemberJwt(memberJwt)) throw makeError('notFound')
  
  // Fetch the organisation the jwt is for
  let organisation = await models.Organisation.findOne({
    _id: memberJwt.org,
    deleted: null,
    members: {
      $elemMatch: {
        _id: memberJwt.mem,
        deletedOn: null,
        confirmedOn: null
      }
    }
  })
  
  // Fail for invalid organisation/member combos
  if (!organisation) throw makeError('notFound')
  
  // Return the organisation and member records
  let member = organisation.members.id(memberJwt.mem)
  api.sendData({
    organisation: organisation.toJSONWithActiveMembers(),
    member: organisation.members.id(memberJwt.mem),
    user: await models.User.findOne(member.user)
  })
}
