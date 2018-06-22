import { RouteContext, AuthCodeType, AuthJwt } from '@/src/types'
import { IAuthCodeWithUser } from '@/src/models'
import { sign } from 'jsonwebtoken'

function makeError (name: string) {
  return `api.auth.login_check.${name}`
}

/* body params:
 * - code ~ The verification code
 */
export default async ({ req, api, models }: RouteContext) => {
  
  // Find a valid authcode with the passed code
  let auth: IAuthCodeWithUser = await models.AuthCode
    .fromCode(req.body.code, AuthCodeType.Login)
    .populate('user') as any
  
  // Fail if the code was not found
  if (!auth) throw makeError('badCode')
  
  // Verify the user if not already
  if (auth.user.verifiedOn === null) {
    auth.user.verifiedOn = new Date()
    await auth.user.save()
  }
  
  // Mark the code as used
  auth.usedOn = new Date()
  await auth.save()
  
  // Generate an authentication
  let payload: AuthJwt = { usr: auth.user.id, loc: auth.user.locale }
  let token = sign(payload, process.env.JWT_SECRET!)
  
  // Send the jwt authentication
  api.sendData({
    user: auth.user,
    token
  })
}
