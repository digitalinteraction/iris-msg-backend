import { makeApiUrl, makeWebUrl } from '../'

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
