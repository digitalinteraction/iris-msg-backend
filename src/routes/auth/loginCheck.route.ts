import { RouteContext, AuthCodeType, AuthJwt } from '../../types'
import { sign } from 'jsonwebtoken'
import { IUser } from '../../models'

function makeError (name: string) {
  return `api.auth.login-check.${name}`
}

export default async ({ req, api, models }: RouteContext) => {
  
  let auth = await models.AuthCode.fromCode(req.body.code, AuthCodeType.Login)
    .populate('user')
  if (!auth) throw makeError('badCode')
  
  let user: IUser = (auth as any).user
  
  let payload: AuthJwt = { usr: user.id, num: user.phoneNumber }
  let token = sign(payload, process.env.JWT_SECRET)
  
  api.sendData({ user, token })
}
