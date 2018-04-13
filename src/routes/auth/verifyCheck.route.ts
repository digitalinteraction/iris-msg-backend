import { Request, Response, NextFunction } from 'express'
import { User, AuthCode } from '../../models'
import { sign } from 'jsonwebtoken'

function makeError (name: string) {
  return `api.login.verifyCheck.${name}`
}

export default async function verifyCheck (req: Request, res: Response, next: NextFunction) {
  try {
    let code = parseInt(req.body.code, 10)
    if (Number.isNaN(code)) throw makeError('badCode')
    
    let auth = await AuthCode.findOne({ code: req.body.code }).populate('user')
    
    if (!auth) throw makeError('badCode')
    
    let user = (auth as any).user
    user.verifiedOn = new Date()
    await user.save()
    
    let payload = { usr: user.id, num: user.phoneNumber }
    let token = sign(payload, process.env.JWT_SECRET)
    
    res.api.sendData({ user, token })
  } catch (error) {
    next(error)
  }
}
