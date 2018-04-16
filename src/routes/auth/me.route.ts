import { RouteContext } from '../../types'

export default async ({ req, api, models }: RouteContext) => {
  
  let query = {
    _id: req.user && req.user.usr,
    verifiedOn: { $ne: null }
  }
  
  api.sendData(
    req.user
      ? await models.User.findOne(query)
      : null
  )
}
