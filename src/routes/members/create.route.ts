import { RouteContext, MemberRole, AllMemberRoles, MemberJwt } from '@/src/types'
import { isMongoId } from '@/src/utils'
import { makeTwilioClient, makeApiUrl, shrinkLink } from '@/src/services'
import phone = require('phone')
import { sign } from 'jsonwebtoken'
import { LocalI18n } from 'src/i18n'

function makeError (name: string) {
  return `api.members.create.${name}`
}

export async function makeMessage (
  i18n: LocalI18n, role: MemberRole, orgName: string, memberId: any, orgId: any
): Promise<string> {
  
  let payload: MemberJwt = { mem: memberId, org: orgId }
  let token = sign(payload, process.env.JWT_SECRET!)
  
  switch (role) {
    case MemberRole.Subscriber:
      const unsubLink = await shrinkLink(
        makeApiUrl(`unsub/${token}`)
      )
      return i18n.translate('sms.newSubscriber', [ orgName, unsubLink ])
      
    case MemberRole.Donor:
      const acceptLink = await shrinkLink(
        makeApiUrl(`open/invite/${token}`)
      )
      return i18n.translate('sms.newDonor', [ orgName, acceptLink ])
      
    case MemberRole.Coordinator:
      return i18n.translate('sms.newCoordinator')
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
  
  let message = await makeMessage(i18n, role as any, org.name, member.id, org.id)
  
  // Send the member an sms
  await makeTwilioClient().messages.create({
    to: phoneNumber,
    from: process.env.TWILIO_NUMBER,
    body: message
  })
  
  api.sendData(member)
}
