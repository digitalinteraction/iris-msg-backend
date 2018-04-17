import { RouteContext } from '../../types'

function makeError (name: string) {
  return `api.auth.updateFcm.${name}`
}

export default async ({ req, res, next, api, models }: RouteContext) => {
  const { User } = models
  
  if (!req.user) throw makeError('badAuth')
  
  let user = await User.findById(req.user.usr)
    .where('verifiedOn', { $ne: null })
  
  if (!user) throw makeError('badAuth')
  
  user.fcmToken = req.body.newToken || null
  await user.save()
  
  return api.sendData('ok')
}
