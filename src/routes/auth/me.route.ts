import { RouteContext } from '../../types'

export default async ({ api, models, authJwt }: RouteContext) => {
  api.sendData(await models.User.findWithJwt(authJwt))
}
