import { Request, Response, NextFunction } from 'express'
import { User, AuthCode } from '../../models'
import { makeTwilioClient } from '../../services'
import phone = require('phone')

function makeError (name: string) {
  return `api.login.verify-request.${name}`
}

function formatCode (code: Number) {
  let formatted = code.toString()
  while (formatted.length < 6) {
    formatted = '0' + formatted
  }
  return formatted.slice(0, 3) + '-' + formatted.slice(3, 6)
}

export default async function verifyRequest (req: Request, res: Response, next: NextFunction) {
  
  let errors: Set<String> = new Set()
  
  let phoneNumber = phone(req.body.phoneNumber, req.body.locale)
  
  if (!req.body.phoneNumber) errors.add(makeError('badNumber'))
  if (!req.body.locale) errors.add(makeError('badLocale'))
  if (phoneNumber.length === 0) errors.add(makeError('badNumber'))
  
  if (errors.size > 0) return next(errors)
  
  try {
    let user = new User({
      phoneNumber: phoneNumber[0],
      locale: req.body.locale
    })
    
    await user.save()
    
    let auth = await AuthCode.forUser(user.id)
    
    let twilio = makeTwilioClient()
    await twilio.messages.create({
      to: phoneNumber,
      from: process.env.TWILIO_NUMBER,
      body: `Your Iris Msg code is ${formatCode(auth.code)}`
    })
    
    res.api.sendData('ok')
  } catch (error) {
    next(error)
  }
}
