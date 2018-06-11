import { RouteContext } from '../../types'

export default async ({ api }: RouteContext) => {
  api.sendData('Hello, World!')
}
