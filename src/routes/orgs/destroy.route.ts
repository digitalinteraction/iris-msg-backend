import { RouteContext, MemberRole } from '../../types'

function makeError (name: string) {
  return `api.orgs.destroy.${name}`
}

export default async ({ req, api, next, models }: RouteContext) => {
  
  // Check the user is verified
  let user = await models.User.findWithJwt(req.user)
  
  // Fail if the user doesn't exist or isn't verified
  if (!user) throw makeError('badAuth')
  
  // Find the organisation where the user is an active coordinator
  let org = await models.Organisation.findOne({
    _id: req.params.id,
    deletedOn: null,
    members: {
      $elemMatch: {
        user: user.id,
        confirmedOn: { $ne: null },
        deletedOn: null,
        role: MemberRole.Coordinator
      }
    }
  })
  
  // Fail if the organisation wasn't found
  if (!org) throw makeError('badAuth')
  
  // Set the organisation to be deleted
  org.deletedOn = new Date()
  await org.save()
  api.sendData('ok')
}
