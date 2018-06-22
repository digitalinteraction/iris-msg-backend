import { RouteContext, MemberRole, AllMemberRoles } from '@/src/types'
import { isMongoId } from '@/src/utils'
import { makeTwilioClient, makeApiUrl } from '@/src/services'
import phone = require('phone')

function makeError (name: string) {
  return `api.members.create.${name}`
}
export function makeMessage (role: MemberRole, orgName: string, memberId: any): string {
  switch (role) {
    case MemberRole.Subscriber:
      const unsubLink = makeApiUrl(`unsub/${memberId}`)
      return `You are now subscribed to ${orgName} on irismsg.io, you can unsubscribe at ${unsubLink}`
      
    case MemberRole.Donor:
      // TODO: Update to use a deep link ...
      const acceptLink = makeApiUrl(`accept/${memberId}`)
      return `You have been invited to donate for ${orgName} on irismsg.io, ${acceptLink}`
      
    case MemberRole.Coordinator:
      return `You have been added as a coordinator to ${orgName} on irismsg.io`
  }
}

/* auth:
 * - jwt
 *
 * url params:
 * - org_id
 *
 * body params:
 * - phoneNumber
 * - countryCode
 * - role
 */
export default async ({ req, api, models, i18n, authJwt }: RouteContext) => {
  let { phoneNumber, countryCode, role } = req.body
  
  // Fail if 'phoneNumber', 'countryCode' or 'role' are not set
  let errors = new Set<String>()
  if (!phoneNumber) errors.add(makeError('badNumber'))
  if (!countryCode) errors.add(makeError('badLocale'))
  if (!role) errors.add(makeError('badRole'))
  if (!AllMemberRoles.includes(role)) errors.add(makeError('badRole'))
  if (!isMongoId(req.params.org_id)) errors.add(makeError('notFound'))
  if (errors.size > 0) throw errors
  
  // Fail if the formatted phoneNumber is invalid
  phoneNumber = phone(phoneNumber, countryCode)[0]
  if (!phoneNumber) throw makeError('badNumber')
  
  // Ensure the User exists & is verified
  let currentUser = await models.User.findWithJwt(authJwt)
  if (!currentUser) throw new Error('api.general.badAuth')
  
  // Ensure the Organisation exists & is coordinated by the user
  let org = await models.Organisation.findByIdForCoordinator(
    req.params.org_id, currentUser.id
  )
  if (!org) throw makeError('notFound')
  
  let newUser = await models.User.findOne({ phoneNumber })
  
  // Create the member if they don't exist
  if (newUser === null) {
    newUser = await models.User.create({
      verifiedOn: new Date(),
      locale: i18n.locale,
      phoneNumber
    })
  } else {
    // Check if they are already a member in that role
    let existingMember = org.members.find(member =>
      member.user.toString() === newUser!.id &&
      member.role === role &&
      member.deletedOn === null &&
      member.confirmedOn !== null
    )
    if (existingMember) throw makeError('alreadyMember')
  }
  
  // Add the member
  // Confirm the record if they arent a donor
  let member = org.members.create({
    user: newUser.id,
    confirmedOn: role === MemberRole.Donor
      ? null
      : new Date(),
    role: role
  })
  
  // Save the Organisation
  org.members.push(member)
  await org.save()
  
  // Send the member an sms
  await makeTwilioClient().messages.create({
    to: phoneNumber,
    from: process.env.TWILIO_NUMBER,
    body: makeMessage(role as MemberRole, org.name, member.id)
  })
  
  api.sendData(member)
}
