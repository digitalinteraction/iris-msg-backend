import * as tst from '../../../../../tools/testHarness'
import unsubscribe from '../unsubscribe.route'
import { IModelSet } from '../../../../models'
import { MemberRole } from '../../../../types'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/members', models)
  agent = tst.mockRoute(unsubscribe, models, { jwt: true })
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('orgs.unsubscribe', () => {
  // TODO: ...
  it('should pass', async () => {
    // ...
  })
})
