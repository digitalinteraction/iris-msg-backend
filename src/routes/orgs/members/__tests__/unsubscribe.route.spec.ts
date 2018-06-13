import * as tst from '../../../../../tools/testHarness'
import unsubscribe from '../unsubscribe.route'
import { IModelSet, IOrganisation, IMember } from '../../../../models'
import { MemberRole } from '../../../../types'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

let org: IOrganisation
let member: IMember

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/members', models)
  agent = tst.mockRoute(unsubscribe, models, { jwt: true })
  
  org = seed.Organisation.a
  member = org.members.create({
    role: MemberRole.Subscriber,
    confirmedOn: null,
    user: seed.User.current.id
  })
  org.members.push(member)
  await org.save()
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('orgs.members.unsubscribe', () => {
  it('should succeed with a http/200', async () => {
    let res = await agent.post(`/${org.id}/${member.id}`)
      .set(tst.jwtHeader(seed.User.current.id))
    expect(res.status).toBe(200)
  })
})
