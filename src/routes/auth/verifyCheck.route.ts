import { RouteContext, AuthCodeType } from '@/src/types'
import { sign } from 'jsonwebtoken'

function makeError (name: string) {
  return `api.auth.verifyCheck.${name}`
}

export default async ({ req, res, next, api, models }: RouteContext) => {
  
  let auth = await models.AuthCode.fromCode(req.body.code, AuthCodeType.Verify)
    .populate('user')
  if (!auth) throw makeError('badCode')
  
  let user = (auth as any).user
  user.verifiedOn = new Date()
  await user.save()
  
  let payload = { usr: user.id, num: user.phoneNumber }
  let token = sign(payload, process.env.JWT_SECRET)
  
  api.sendData({ user, token })
}
