import { AuthCodeType, RouteContext } from '../../types'
import { makeTwilioClient } from '../../services'
import phone = require('phone')

function makeError (name: string) {
  return `api.auth.loginRequest.${name}`
}

export default async ({ req, res, next, api, models }: RouteContext) => {
  const { User, AuthCode } = models
  
  let errors = new Set<String>()
  
  let phoneNumber = phone(req.body.phoneNumber, req.body.locale)
  
  if (!req.body.phoneNumber) errors.add(makeError('badNumber'))
  if (!req.body.locale) errors.add(makeError('badLocale'))
  if (phoneNumber.length === 0) errors.add(makeError('badNumber'))
  
  if (errors.size > 0) return next(errors)
  
  let user = await User.findOne({
    phoneNumber,
    verifiedOn: { $ne: null }
  })
  
  if (user) {
    let auth = await AuthCode.forUser(user.id, AuthCodeType.Login)
    
    await makeTwilioClient().messages.create({
      to: phoneNumber,
      from: process.env.TWILIO_NUMBER,
      body: `Your Iris Msg code is ${auth.formatted}`
    })
  }
  api.sendData('ok')
}
