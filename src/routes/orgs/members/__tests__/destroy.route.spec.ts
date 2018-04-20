import * as tst from '../../../../../tools/testHarness'
import destroy from '../destroy.route'
import { IModelSet } from '../../../../models'
import { MemberRole } from '../../../../types'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/members', models)
  agent = tst.mockRoute(destroy, models, { jwt: true, path: '/:org_id/:mem_id' })
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('orgs.destroy', () => {
  // TODO: ...
  it('should pass', async () => {
    // ...
  })
})
