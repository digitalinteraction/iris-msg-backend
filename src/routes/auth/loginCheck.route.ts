import { Request, Response, NextFunction } from 'express'

export default function hello (req: Request, res: Response, next: NextFunction) {
  res.api.sendData('ok')
}
