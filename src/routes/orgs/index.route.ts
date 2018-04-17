import { RouteContext, MemberRole } from '../../types'

function makeError (name: string) {
  return `api.orgs.index.${name}`
}

export default async ({ req, api, next, models }: RouteContext) => {
  
  // Check the user is verified
  let user = await models.User.findWithJwt(req.user)
  
  if (!user) return api.sendData([])
  
  api.sendData(
    await models.Organisation.findForUser(user.id)
  )
}
