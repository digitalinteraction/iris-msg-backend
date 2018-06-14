import { RouteContext, MemberRole } from '@/src/types'

function makeError (name: string) {
  return `api.orgs.create.${name}`
}

// TODO: set locale from the request

export default async ({ req, api, next, models, authJwt }: RouteContext) => {
  
  // Check the user is verified
  let user = (await models.User.findWithJwt(authJwt))!
  
  // Check name & info are set
  let errors = new Set<string>()
  if (!user) errors.add('api.general.badAuth')
  if (!req.body.name) errors.add(makeError('badName'))
  if (!req.body.info) errors.add(makeError('badInfo'))
  if (errors.size > 0) throw errors
  
  // Create the organisation
  let org = await models.Organisation.create({
    name: req.body.name,
    info: req.body.info,
    members: [
      {
        role: MemberRole.Coordinator,
        confirmedOn: new Date(),
        user: user.id
      },
      {
        role: MemberRole.Donor,
        confirmedOn: new Date(),
        user: user.id
      }
    ]
  })
  
  api.sendData(org)
}
