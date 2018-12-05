import { RouteContext } from '@/src/types'

export default async ({ api, i18n }: RouteContext) => {
  api.sendData(i18n.translate('api.general.hello'))
}
