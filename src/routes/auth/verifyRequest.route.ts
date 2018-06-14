import { AuthCodeType, RouteContext } from '@/src/types'
import { makeTwilioClient } from '@/src/services'
import phone = require('phone')

function makeError (name: string) {
  return `api.auth.verifyRequest.${name}`
}

export default async ({ req, res, next, api, models }: RouteContext) => {
  const { User, AuthCode } = models
  
  let errors = new Set<String>()
  if (!req.body.phoneNumber) errors.add(makeError('badNumber'))
  if (!req.body.locale) errors.add(makeError('badLocale'))
  if (errors.size > 0) throw errors
  
  let phoneNumber = phone(req.body.phoneNumber, req.body.locale)[0]
  if (!phoneNumber) throw makeError('badNumber')
  
  let user = await User.findOne({ phoneNumber })
  
  if (user) {
    // TODO: could http/200 to prevent information leak?
    if (user.verifiedOn !== null) throw makeError('badNumber')
  } else {
    user = await User.create({
      phoneNumber: phoneNumber,
      locale: req.body.locale
    })
  }
  
  let auth = await AuthCode.forUser(user.id, AuthCodeType.Verify)
  
  await makeTwilioClient().messages.create({
    to: phoneNumber,
    from: process.env.TWILIO_NUMBER,
    body: `Your Iris Msg code is ${auth.formatted}`
  })
  
  api.sendData('ok')
}
