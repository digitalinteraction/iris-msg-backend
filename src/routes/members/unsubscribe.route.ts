import { RouteContext, MemberRole, MemberJwt } from '@/src/types'
import { isMemberJwt } from '@/src/utils'
import { verify } from 'jsonwebtoken'

function makeError(name: string) {
  return `api.members.unsubscribe.${name}`
}

/* url params:
 * - token
 */
export default async ({ req, res, models }: RouteContext) => {
  try {
    // Decode the jwt payload
    let payload = verify(req.params.token, process.env.JWT_SECRET!) as MemberJwt

    // Fail for invalid payloads
    if (!isMemberJwt(payload)) throw new Error()

    // Find an organisation with that confirmed member
    let org = await models.Organisation.findOne({
      _id: payload.org,
      deletedOn: null,
      members: {
        $elemMatch: {
          _id: payload.mem,
          role: MemberRole.Subscriber,
          deletedOn: null,
          confirmedOn: { $ne: null }
        }
      }
    })

    // Fail for invalid org/member combos
    if (!org) throw new Error()

    // Delete the member & save
    let mem = org.members.id(payload.mem)
    mem.deletedOn = new Date()
    await org.save()

    // Let the user know what happend (human readable)
    res.send('<p>You have been unsubscribed</p>')
  } catch (error) {
    res.status(400).send(makeError('notFound'))
  }
}
