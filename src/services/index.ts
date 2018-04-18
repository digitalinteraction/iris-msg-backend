export { makeTwilioClient } from './twilio.service'

export function makeApiUrl (path: string) {
  return cleanPathEnd(process.env.API_URL) + '/' + cleanPathStart(path)
}

export function makeWebUrl (path: string) {
  return cleanPathEnd(process.env.WEB_URL) + '/' + cleanPathStart(path)
}

const cleanPathStart = (path: string) => path.replace(/^\//, '')
const cleanPathEnd = (path: string) => path.replace(/\/$/, '')
