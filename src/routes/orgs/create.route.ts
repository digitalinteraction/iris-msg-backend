import { RouteContext, MemberRole } from '@/src/types'

function makeError (name: string) {
  return `api.orgs.create.${name}`
}

// TODO: set locale from the request

/* auth:
 * - jwt
 *
 * body params:
 * - name
 * - info
 */
export default async ({ req, api, models, authJwt }: RouteContext) => {
  const { name, info } = req.body
  
  // Check the user is verified
  let user = (await models.User.findWithJwt(authJwt))!
  
  // Check name & info are set
  let errors = new Set<string>()
  if (!user) errors.add('api.general.badAuth')
  if (!name || name.length >= 30) errors.add(makeError('badName'))
  if (!info || info.length >= 140) errors.add(makeError('badInfo'))
  if (errors.size > 0) throw errors
  
  // Create the organisation
  let org = await models.Organisation.create({
    name: name,
    info: info,
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
