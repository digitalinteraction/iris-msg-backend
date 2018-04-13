import { Request, Response, NextFunction } from 'express'
import { User } from '../../models'

export default async function me (req: Request, res: Response, next: NextFunction) {
  res.api.sendData(
    req.user
      ? await User.findById(req.user.usr)
      : null
  )
}
