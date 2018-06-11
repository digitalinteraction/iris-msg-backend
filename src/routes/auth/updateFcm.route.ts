import { RouteContext } from '../../types'

// function makeError (name: string) {
//   return `api.auth.updateFcm.${name}`
// }

const authError = 'api.general.badAuth'

export default async ({ req, api, models, authJwt }: RouteContext) => {
  const { User } = models
  
  let user = await User.findWithJwt(authJwt)
  
  if (!user) throw new Error('api.general.badAuth')
  
  user.fcmToken = req.body.newToken || null
  await user.save()
  
  return api.sendData('ok')
}
