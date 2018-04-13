import { Request, Response, NextFunction } from 'express'
import { User, AuthCode, AuthCodeType } from '../../models'
import { makeTwilioClient } from '../../services'
import phone = require('phone')

function makeError (name: string) {
  return `api.login.loginRequest.${name}`
}

export default async function loginRequest (req: Request, res: Response, next: NextFunction) {
  try {
    let errors = new Set<String>()
    
    let phoneNumber = phone(req.body.phoneNumber, req.body.locale)
    
    if (!req.body.phoneNumber) errors.add(makeError('badNumber'))
    if (!req.body.locale) errors.add(makeError('badLocale'))
    if (phoneNumber.length === 0) errors.add(makeError('badNumber'))
    
    if (errors.size > 0) return next(errors)
    
    let user = await User.findOne({ phoneNumber })
    
    if (user) {
      let auth = await AuthCode.forUser(user.id, AuthCodeType.Login)
      
      let client = makeTwilioClient()
      await client.messages.create({
        to: phoneNumber,
        from: process.env.TWILIO_NUMBER,
        body: `Your Iris Msg code is ${auth.formatted}`
      })
    }
    
    req.api.sendData('ok')
    
  } catch (error) {
    next(error)
  }
}
