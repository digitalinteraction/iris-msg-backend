import { Request, Response, NextFunction } from 'express'

export default function hello (req: Request, res: Response, next: NextFunction) {
  res.api.sendData('ok')
}

// export function loginCheckRoute (ctx: RouteContext) {
//   const { api, models: { User, Organisation } } = ctx
//
//   return function (req: Request, res: Response, next: NextFunction) {
//     // ...
//   }
// }
