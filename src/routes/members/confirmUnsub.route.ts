import { RouteContext, MemberJwt, MemberRole } from '@/src/types'
import { isMemberJwt, compilePug } from '@/src/utils'
import { verify } from 'jsonwebtoken'
import { join } from 'path'

function makeError (name: string) {
  return `api.members.confirmUnsub.${name}`
}

const template = compilePug(join(__dirname, '../../../templates/confirmUnsub.pug'))

/*
 *
 */
export default async ({ req, res, models }: RouteContext) => {
  try {
    // Decode the jwt payload
    let payload = verify(req.params.token, process.env.JWT_SECRET!) as MemberJwt
    
    // Fail for invalid payloads
    if (!isMemberJwt(payload)) throw makeError('notFound')

    // Fetch the organisation they're unsubscribing to
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

    if (!org) throw makeError('notFound')

    // Render the page to action the unsubscription
    res.send(template({
      title: 'Unsubscribe',
      unsubLink: `/unsub/${req.params.token}/confirm`,
      org
    }))

  } catch (error) {
    if (typeof error === 'string') throw error
    res.status(400).send(error.message)
  }
}
