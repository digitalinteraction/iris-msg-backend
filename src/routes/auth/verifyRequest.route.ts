import { Request, Response, NextFunction } from 'express'
import { User } from '../../models'

export default async function verifyRequest (req: Request, res: Response, next: NextFunction) {
  
  let user = new User({
    phoneNumber: req.body.phoneNumber,
    locale: req.body.locale
  })
  
  await user.save()
  
  res.send('ok')
}
