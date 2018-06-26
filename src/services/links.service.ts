import axios from 'axios'

const cleanPathStart = (path: string) => path.replace(/^\//, '')
const cleanPathEnd = (path: string) => path.replace(/\/$/, '')

export function makeApiUrl (path: string) {
  return cleanPathEnd(process.env.API_URL!) + '/' + cleanPathStart(path)
}

export function makeWebUrl (path: string) {
  return cleanPathEnd(process.env.WEB_URL!) + '/' + cleanPathStart(path)
}

export function canShrink (): boolean {
  return process.env.SHRINK_URL !== undefined &&
    process.env.SHRINK_KEY !== undefined
}

export function makeShrinkAgent () {
  return axios.create({
    baseURL: process.env.SHRINK_URL,
    data: { token: process.env.SHRINK_KEY }
  })
}

export async function shrinkLink (longUrl: string): Promise<string> {
  try {
    const shrinkAgent = canShrink() ? makeShrinkAgent() : null
    if (!shrinkAgent) throw new Error('Url Shrinker unavailable')
    
    let res = await shrinkAgent.post('/', { url: longUrl })
    
    return res.data.public || `${process.env.SHRINK_URL}/${res.data.short}`
  } catch (error) {
    return longUrl
  }
}
