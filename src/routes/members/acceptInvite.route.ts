import { RouteContext, MemberJwt, AuthJwt } from '@/src/types'
import { isMemberJwt } from '@/src/utils'
import { verify, sign } from 'jsonwebtoken'

function makeError(name: string) {
  return `api.members.accept.${name}`
}

/* url params:
 * - token
 */
export default async ({ req, api, models }: RouteContext) => {
  // Decode the jwt payload
  let memberPayload: MemberJwt
  try {
    memberPayload = verify(req.params.token, process.env.JWT_SECRET!) as any
  } catch (error) {
    throw makeError('notFound')
  }

  // Fail for invalid jwts
  if (!isMemberJwt(memberPayload)) throw makeError('notFound')

  // Find an organisation with that unconfirmed member
  let org = await models.Organisation.findOne({
    _id: memberPayload.org,
    deletedOn: null,
    members: {
      $elemMatch: {
        _id: memberPayload.mem,
        deletedOn: null,
        confirmedOn: null
      }
    }
  })
  if (!org) throw makeError('notFound')

  // Find the member and its user record
  let member = org.members.id(memberPayload.mem)
  let user = await models.User.findById(member.user)

  if (!user) throw makeError('notFound')

  // Mark the meber as confirmed
  member.confirmedOn = new Date()
  await org.save()

  // Generate a user auth jwt
  let payload: AuthJwt = { usr: user!.id, loc: user!.locale }

  // Send back the organisation, user and a signed jwt auth token
  api.sendData({
    organisation: org.toJSONWithActiveMembers(),
    token: sign(payload, process.env.JWT_SECRET!),
    user
  })
}
