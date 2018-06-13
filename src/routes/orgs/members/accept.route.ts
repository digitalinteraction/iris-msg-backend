import { RouteContext } from '../../../types'

function makeError (name: string) {
  return `api.orgs.members.accept.${name}`
}

/* url params:
 * - org_id ~ the id of the organisation
 * - mem_id ~ The id of the member
 */
export default async ({ req, api, models, authJwt }: RouteContext) => {
  
  // Find the current user
  let user = await models.User.findWithJwt(authJwt)
  if (!user) throw makeError('api.general.badAuth')
  
  // Find the organisation
  let org = await models.Organisation.findOne({
    _id: req.params.org_id,
    deletedOn: null,
    members: {
      $elemMatch: {
        _id: req.params.mem_id,
        user: user.id,
        deletedOn: null
      }
    }
  })
  if (!org) throw makeError('notFound')
  
  let member = org.members.id(req.params.mem_id)
  member.confirmedOn = new Date()
  await org.save()
  
  api.sendData(member)
}
