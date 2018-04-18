import { RouteContext } from '../../types'

function makeError (name: string) {
  return `api.orgs.show.${name}`
}

export default async ({ req, api, next, models }: RouteContext) => {
  
  // Check the user is verified
  let user = await models.User.findWithJwt(req.user)
  
  if (!user) throw makeError('notFound')
  
  let [ org ] = await models.Organisation.findForUser(user.id)
    .where('_id', req.params.id)
    .limit(1)
  
  if (!org) throw makeError('notFound')
  else api.sendData(org)
}
