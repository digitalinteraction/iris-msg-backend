import { RouteContext } from '../../../types'

function makeError (name: string) {
  return `api.orgs.members.destroy.${name}`
}

/* url params
 * org_id: string ~ The id of the organisation
 * mem_id: string ~ The id of the member to remove
 */
export default async ({ req, api, models, authJwt }: RouteContext) => {
  
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
  if (!member) throw makeError('notMember')
  
  // Mark the membership as deleted
  member.deletedOn = new Date()
  await org.save()
  
  // Return a success
  api.sendData('ok')
}
