import { RouteContext } from '../../../types'

function makeError (name: string) {
  return `api.orgs.members.destroy.${name}`
}

export default async ({ req, api, next, models }: RouteContext) => {
  
  // let user = await models.User.findWithJwt(req.user)
  //
  // if (!user) new Error('api.general.badAuth')
  //
  // let org = await models.Organisation.findByIdForCoordinator(
  //   req.params.org_id, user.id
  // )
  //
  // if (!org) throw makeError('notFound')
  //
  // let member = org.members.id(req.params.mem_id)
  //
  // if (!member) throw makeError('notFound')
  //
  // member.deletedOn = null
  // await org.save()
  
  api.sendData('ok')
}
