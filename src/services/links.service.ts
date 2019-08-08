import axios from 'axios'

const cleanPathStart = (path: string) => path.replace(/^\//, '')
const cleanPathEnd = (path: string) => path.replace(/\/$/, '')

type ShrunkURL = {
  id: string
  createdAt: string
  updatedAt: string
  active: boolean
  creator_id: string
  long: string
  public?: string
  short: string
  uses: number
}

export function makeApiUrl(path: string) {
  return cleanPathEnd(process.env.API_URL!) + '/' + cleanPathStart(path)
}

export function makeWebUrl(path: string) {
  return cleanPathEnd(process.env.WEB_URL!) + '/' + cleanPathStart(path)
}

export function canShrink(): boolean {
  return (
    process.env.SHRINK_URL !== undefined && process.env.SHRINK_KEY !== undefined
  )
}

export function makeShrinkAgent() {
  return axios.create({
    baseURL: process.env.SHRINK_URL,
    data: { token: process.env.SHRINK_KEY }
  })
}

export async function shrinkLink(longUrl: string): Promise<string> {
  try {
    // Do nothing if we don't have the environment variables to shrink
    if (!canShrink()) throw new Error('Url Shrinker unavailable')

    // Create an agent to do the shrinking
    const agent = axios.create({ baseURL: process.env.SHRINK_URL })

    // Request a shrunken URL
    const res = await agent.post<ShrunkURL>('/', {
      token: process.env.SHRINK_KEY,
      url: longUrl
    })

    // Return the public url
    // Fallback to the long url (public may not be set if shrinky is misconfigured)
    return res.data.public || longUrl
  } catch (error) {
    return longUrl
  }
}
