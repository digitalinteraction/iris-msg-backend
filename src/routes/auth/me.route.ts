import { RouteContext } from '@/src/types'

export default async ({ api, models, authJwt }: RouteContext) => {
  api.sendData(await models.User.findWithJwt(authJwt))
}
