import { Api, IApiOptions } from 'api-formatter'

export default function (options: IApiOptions = {}) {
  return Api.middleware({ ...options, name: 'iris-msg-api' })
}
