import { RouteContext, MemberRole, AllMemberRoles } from '../../../types'
import { makeTwilioClient, makeApiUrl } from '../../../services'
import { IModelSet, IUser } from '../../../models'
import { sign } from 'jsonwebtoken'
import phone = require('phone')

function makeError (name: string) {
  return `api.orgs.members.invite.${name}`
}

export default async ({ req, api, next, models }: RouteContext) => {
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
  let currentUser = await models.User.findWithJwt(req.user)
  if (!currentUser) throw new Error('api.general.badAuth')
  
  // Ensure the Organisation exists & is coordinated by the user
  let org = await models.Organisation.findByIdForCoordinator(
    req.params.org_id, currentUser.id
  )
  if (!org) throw makeError('notFound')
  
  // TODO: Should check if they are already a member in hat role
  //       + if deactivated/
  
  let newMember: IUser | null = null
  
  // TODO: See if the user is already a member on the org
  // -> Might need a join on Organisation.members.user ?
  
  // Find a user with the phone number
  newMember = await models.User.findOne({ phoneNumber })
  
  // Create the member if they don't exist
  if (!newMember) {
    newMember = await models.User.create({
      phoneNumber, verifiedOn: new Date()
    })
  }
  
  // Add the member
  // Confirm the record if they arent a donor
  let member = org.members.create({
    user: newMember.id,
    confirmedOn: role === MemberRole.Donor
      ? null
      : new Date(),
    role: role
  })
  
  // Save the Organisation
  org.members.push(member)
  await org.save()
  
  // Generate unsubscribe token
  let unsubToken = makeApiUrl(`u/${member.id}`)
  
  // Send the member an sms
  await makeTwilioClient().messages.create({
    to: phoneNumber,
    from: process.env.TWILIO_NUMBER,
    body: `You have been subscribed to ${org.name} on Iris Msg, you can unsubscribe at ${unsubToken}`
  })
  
  api.sendData(member)
}
