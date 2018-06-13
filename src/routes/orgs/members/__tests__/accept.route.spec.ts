import * as tst from '../../../../../tools/testHarness'
import accept from '../accept.route'
import { IModelSet } from '../../../../models'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/members', models)
  agent = tst.mockRoute(accept, models, { jwt: true })
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('orgs.members.accept', () => {
  // TODO: ...
  it('should pass', async () => {
    // ...
  })
})
