import * as tst from '@/tools/testHarness'
import attemptsIndex from '../attemptsIndex.route'
import { IModelSet, IOrganisation, makeModels } from '@/src/models'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

let org: IOrganisation

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/messages', models)
  agent = tst.mockRoute(attemptsIndex, models, { jwt: true })
  
  org = seed.Organisation.a
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('messages.attempts_index', () => {
  it('should succeed with http/200', async () => {
    let res = await agent.post('/')
      .set(tst.jwtHeader(seed.User.current.id))
    expect(res.status).toBe(200)
  })
})
