import { Api, Messages, IApiOptions, MetaBlock } from 'api-formatter'
import { LocalisedApi } from '@/src/i18n'

export default function (options: IApiOptions = {}) {
  return LocalisedApi.middleware(options)
}
