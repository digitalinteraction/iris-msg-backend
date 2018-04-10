import { Request, Response, NextFunction } from 'express'

export default function me (req: Request, res: Response, next: NextFunction) {
  res.api.sendData(req.user || null)
}
