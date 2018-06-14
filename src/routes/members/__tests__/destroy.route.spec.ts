import * as tst from '@/tools/testHarness'
import destroy from '../destroy.route'
import { IModelSet, IOrganisation, IMember } from '@/src/models'
import { MemberRole } from '@/src/types'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

let org: IOrganisation
let subscriber: IMember

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/members', models)
  agent = tst.mockRoute(destroy, models, {
    jwt: true, path: '/:org_id/:mem_id'
  })
  
  org = seed.Organisation.a
  let coordinator = org.members.create({
    role: MemberRole.Coordinator,
    confirmedOn: new Date(),
    user: seed.User.current.id
  })
  subscriber = org.members.create({
    role: MemberRole.Subscriber,
    confirmedOn: new Date(),
    user: seed.User.verified.id
  })
  org.members.push(coordinator)
  org.members.push(subscriber)
  await org.save()
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('orgs.members.destroy', () => {
  it('should succeed with a http/200', async () => {
    let res = await agent.delete(`/${org.id}/${subscriber.id}`)
      .set(tst.jwtHeader(seed.User.current.id))
    expect(res.status).toBe(200)
  })
  
  it('should mark the member as deleted', async () => {
    await agent.delete(`/${org.id}/${subscriber.id}`)
      .set(tst.jwtHeader(seed.User.current.id))
    let updatedOrg = await models.Organisation.findById(org.id)
    let updatedSub = updatedOrg!.members.id(subscriber.id)
    expect(updatedSub.deletedOn).toBeInstanceOf(Date)
  })
})
