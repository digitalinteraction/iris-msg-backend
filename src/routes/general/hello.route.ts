import { RouteContext } from '@/src/types'

export default async ({ api }: RouteContext) => {
  api.sendData('Hello, World!')
}
