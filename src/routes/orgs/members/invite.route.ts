import { RouteContext, MemberRole } from '../../../types'

function makeError (name: string) {
  return `api.orgs.members.invite.${name}`
}

export default async ({ req, api, next, models }: RouteContext) => {
  
  // Get the organisation making sure you are a coordanator
  let user = await models.User.findWithJwt(req.user)
  
  if (!user) throw makeError('badAuth')
  
  let org = await models.Organisation.findByIdForCoordinator(
    req.params.id, user.id
  )
  
  if (!org) throw makeError('notFound')
  
  // Format the phone number
  
  // Find the User
  
  // If no
  
  // Add a membership them
  
  // If a donor, add them unconfirmed
  
  api.sendData('ok')
}
