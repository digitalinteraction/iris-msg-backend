import * as tst from '@/tools/testHarness'
import handle from '../handle.route'
import { IModelSet, IOrganisation } from '@/src/models'
import { MemberRole } from '@/src/types'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

beforeEach(async () => {
  ;({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/orgs', models)
  agent = tst.mockRoute(handle, models)

  tst.addMember(seed.Organisation.a, seed.User.verified, MemberRole.Subscriber)
  await seed.Organisation.a.save()
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('sms.handle', () => {
  it('should unsubscribe the member', async () => {
    let res = await agent
      .post('/')
      .send({ Body: 'STOP 123456', From: '+447880123001' })

    expect(res.status).toEqual(200)

    let org = await models.Organisation.findById(seed.Organisation.a.id)

    expect(org!.members[0].deletedOn).toBeInstanceOf(Date)
  })
})
