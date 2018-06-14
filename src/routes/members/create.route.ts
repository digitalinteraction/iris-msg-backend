import { RouteContext, MemberRole, AllMemberRoles } from '../../types'
import { makeTwilioClient, makeApiUrl } from '../../services'
import phone = require('phone')

function makeError (name: string) {
  return `api.orgs.members.create.${name}`
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

export default async ({ req, api, models, authJwt }: RouteContext) => {
  let { phoneNumber, locale, role } = req.body
  
  // Fail if 'phoneNumber', 'locale' or 'role' are not set
  let errors = new Set<String>()
  if (!phoneNumber) errors.add(makeError('badNumber'))
  if (!locale) errors.add(makeError('badLocale'))
  if (!role) errors.add(makeError('badRole'))
  if (!AllMemberRoles.includes(role)) errors.add(makeError('badRole'))
  if (errors.size > 0) throw errors
  
  // Fail if the formatted phoneNumber is invalid
  phoneNumber = phone(phoneNumber, locale)[0]
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
  if (!newUser) {
    newUser = await models.User.create({
      phoneNumber, verifiedOn: new Date()
    })
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
