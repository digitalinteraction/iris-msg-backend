import { RouteContext, AuthJwt } from '@/src/types'
import { sign } from 'jsonwebtoken'

function makeError (name: string) {
  return `api.members.accept.${name}`
}

/* url params:
 * - mem_id ~ The id of the member
 */
export default async ({ req, api, models, authJwt }: RouteContext) => {
  
  // Find an organisation with that unconfirmed member
  let org = await models.Organisation.findOne({
    deletedOn: null,
    members: {
      $elemMatch: {
        _id: req.params.mem_id,
        deletedOn: null,
        confirmedOn: null
      }
    }
  })
  if (!org) throw makeError('notFound')
  
  // Find the member and its user record
  let member = org.members.id(req.params.mem_id)
  let user = await models.User.findById(member.user)
  
  if (!user) throw makeError('notFound')
  
  // Mark the meber as confirmed
  member.confirmedOn = new Date()
  await org.save()
  
  // Generate a user auth jwt
  let payload: AuthJwt = { usr: user!.id }
  let token = sign(payload, process.env.JWT_SECRET)
  
  api.sendData({ user, token })
}
