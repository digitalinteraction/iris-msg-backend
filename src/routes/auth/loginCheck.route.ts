import { RouteContext, AuthCodeType, AuthJwt } from '@/src/types'
import { IAuthCodeWithUser } from '@/src/models'
import { sign } from 'jsonwebtoken'

function makeError (name: string) {
  return `api.auth.login-check.${name}`
}

export default async ({ req, api, models }: RouteContext) => {
  
  // Find a valid authcode with the passed code
  let auth: IAuthCodeWithUser = await models.AuthCode
    .fromCode(req.body.code, AuthCodeType.Login)
    .populate('user') as any
  
  // Fail if the code was not found
  if (!auth) throw makeError('badCode')
  
  // Verify the user if not already
  if (auth.user.verifiedOn === null) {
    await auth.user.update({ verifiedOn: new Date() })
  }
  
  // Generate an authentication
  let payload: AuthJwt = { usr: auth.user.id }
  let token = sign(payload, process.env.JWT_SECRET)
  
  // Send the jwt authentication
  api.sendData({
    user: auth.user,
    token
  })
}
