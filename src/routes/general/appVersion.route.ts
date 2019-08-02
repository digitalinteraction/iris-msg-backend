import { RouteContext } from '@/src/types'

export default async ({ api }: RouteContext) => {
  api.sendData({
    version: process.env.LATEST_APP_VERSION,
    url: process.env.LATEST_APP_URL
  })
}
