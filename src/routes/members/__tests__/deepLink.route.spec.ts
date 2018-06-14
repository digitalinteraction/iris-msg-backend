import * as tst from '@/tools/testHarness'
import deepLink from '../deepLink.route'
import { IModelSet } from '@/src/models'
import { MemberRole } from '@/src/types'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/members', models)
  agent = tst.mockRoute(deepLink, models, { jwt: true })
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('orgs.members.deepLink', () => {
  // TODO: ...
  it('should pass', async () => {
    // ...
  })
})
