import axios from 'axios'
import { makeApiUrl, makeWebUrl, shrinkLink } from '../links.service'

jest.mock('axios')

const mockShortLink = {
  id: '5b22fc81eb7d7f000f25cf86',
  createdAt: '2018-06-14T23:38:41.984Z',
  updatedAt: '2018-06-14T23:38:41.984Z',
  short: 'lEWxaq',
  long: 'https://google.com',
  public: 'https://go.r0b.io/lEWxaq',
  uses: 0,
  active: true,
  creator_id: '5b22f62a67dad80010e54232'
}

describe('#makeApiUrl', () => {
  it('should format the url', async () => {
    let url = makeApiUrl('/some/endpoint')
    expect(url).toBe('http://localhost:3000/some/endpoint')
  })
})

describe('#makeWebUrl', () => {
  it('should format the url', async () => {
    let url = makeWebUrl('/home')
    expect(url).toBe('http://localhost:8080/home')
  })
})

describe('#shrinkLink', () => {
  ;(axios.create as any).mockReturnValue({
    post: jest.fn().mockReturnValue({ data: mockShortLink })
  })

  afterEach(() => {
    jest.resetModules()
  })

  it('should return the shortened link', async () => {
    process.env.SHRINK_URL = 'shrinky'
    process.env.SHRINK_KEY = 'top_secret'

    let short = await shrinkLink('https://google.com')
    expect(short).toBe('https://go.r0b.io/lEWxaq')
  })
})
