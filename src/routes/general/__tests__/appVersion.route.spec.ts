import * as tst from '@/tools/testHarness'
import appVersion from '../appVersion.route'

let db: any
let models: tst.IModelSet
let agent: tst.Agent

beforeEach(async () => {
  ;({ db, models } = await tst.openDb())
  agent = tst.mockRoute(appVersion, models)
})

afterEach(async () => tst.closeDb(db))

describe('general.app_version', () => {
  it('should return an http/200', async () => {
    let res = await agent.get('/')
    expect(res.status).toBe(200)
  })
  it('should return the release name', async () => {
    let res = await agent.get('/')
    expect(res.body.data.version).toEqual('1.2')
  })
  it('should return the release url', async () => {
    let res = await agent.get('/')
    expect(res.body.data.url).toEqual('http://app.irismsg.io')
  })
})
