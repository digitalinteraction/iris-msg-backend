import { RouteContext } from '../../types'

export default async ({ req, api, models }: RouteContext) => {
  api.sendData(await models.User.findWithJwt(req.user))
}
