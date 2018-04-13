import { Request, Response, NextFunction } from 'express'
import { User, AuthCode, AuthCodeType } from '../../models'
import { makeTwilioClient } from '../../services'
import phone = require('phone')

function makeError (name: string) {
  return `api.login.verifyRequest.${name}`
}

export default async function verifyRequest (req: Request, res: Response, next: NextFunction) {
  try {
    let errors = new Set<String>()
    
    let phoneNumber = phone(req.body.phoneNumber, req.body.locale)
    
    if (!req.body.phoneNumber) errors.add(makeError('badNumber'))
    if (!req.body.locale) errors.add(makeError('badLocale'))
    if (phoneNumber.length === 0) errors.add(makeError('badNumber'))
    
    if (errors.size > 0) return next(errors)
    
    let user = new User({
      phoneNumber: phoneNumber[0],
      locale: req.body.locale
    })
    
    await user.save()
    
    let auth = await AuthCode.forUser(user.id, AuthCodeType.Verify)
    
    let twilio = makeTwilioClient()
    await twilio.messages.create({
      to: phoneNumber,
      from: process.env.TWILIO_NUMBER,
      body: `Your Iris Msg code is ${auth.formatted}`
    })
    
    res.api.sendData('ok')
  } catch (error) {
    next(error)
  }
}
