import * as tst from '../../../../../tools/testHarness'
import accept from '../accept.route'
import * as models from '../../../../models'
import { MemberRole } from '../../../../types'

let db: any
let seed: tst.Seed
let agent: tst.Agent

beforeEach(async () => {
  db = await tst.openDb()
  seed = await tst.applySeed('test/members', models)
  agent = tst.mockRoute(accept, models, { jwt: true })
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('orgs.accept', () => {
  // TODO: ...
  it('should pass', async () => {
    // ...
  })
})
