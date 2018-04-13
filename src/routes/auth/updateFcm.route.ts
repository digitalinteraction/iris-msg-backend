import { Request, Response, NextFunction } from 'express'
import { User } from '../../models'

export default async function updateFcm (req: Request, res: Response, next: NextFunction) {
  
  if (req.user && req.user.usr) {
    let user = await User.findById(req.user.usr)
    if (user) {
      user.fcmToken = req.body.newToken || null
      await user.save()
    }
  }
  
  res.api.sendData('ok')
}
