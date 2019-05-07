import { AuthCodeType, RouteContext } from '@/src/types'
import { makeTwilioClient } from '@/src/services'
import phone from 'phone'

function makeError (name: string) {
  return `api.auth.login_request.${name}`
}

/* body params:
 * - phoneNumber ~ The phone number to login with e.g. 07880123456
 * - countryCode ~ The 'ISO_3166-2' country code e.g. GB
 */
export default async ({ req, api, models, i18n }: RouteContext) => {
  const { phoneNumber, countryCode } = req.body
  
  // Validate the correct body parameters were passed
  let errors = new Set<String>()
  if (!phoneNumber) errors.add(makeError('badNumber'))
  if (!countryCode) errors.add(makeError('badCountry'))
  if (errors.size > 0) throw errors
  
  // Validate the phone number
  let parsedNumber = phone(req.body.phoneNumber, countryCode)[0]
  if (!parsedNumber) throw makeError('badNumber')
  
  // See if a user already exists with that number
  let user = await models.User.findOne({ phoneNumber: parsedNumber })
  
  // Create a new user if they don't exist
  if (!user) {
    user = await models.User.create({
      locale: i18n.locale,
      phoneNumber: parsedNumber
    })
  }
  
  // Create an auth code to login with
  let auth = await models.AuthCode.forUser(user.id, AuthCodeType.Login)
  
  // Send the authentication code
  await makeTwilioClient().messages.create({
    to: parsedNumber,
    from: process.env.TWILIO_NUMBER,
    body: i18n.translate('sms.loginRequest', [
      auth.formatted
    ])
  })
  
  // Return a success resposne
  api.sendData('ok')
}
