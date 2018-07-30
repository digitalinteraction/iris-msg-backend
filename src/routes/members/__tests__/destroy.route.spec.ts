import * as tst from '@/tools/testHarness'
import destroy from '../destroy.route'
import { IModelSet, IOrganisation, IMember } from '@/src/models'
import { MemberRole } from '@/src/types'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

let org: IOrganisation
let coordinator: IMember
let donor: IMember
let subscriber: IMember

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/members', models)
  agent = tst.mockRoute(destroy, models, {
    jwt: true, path: '/:org_id/:mem_id'
  })
  
  org = seed.Organisation.a
  coordinator = tst.addMember(org, seed.User.current, MemberRole.Coordinator)
  donor = tst.addMember(org, seed.User.current, MemberRole.Donor)
  subscriber = tst.addMember(org, seed.User.verified, MemberRole.Subscriber)
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
  
  it('should fail gracefully for bad org_ids', async () => {
    let res = await agent.delete(`/${org.id}abc/${subscriber.id}`)
      .set(tst.jwtHeader(seed.User.current.id))
    expect(res.status).toBe(400)
    expect(res.body.meta.codes).toContain('api.members.destroy.notFound')
  })
  
  it('should fail gracefully for bad mem_ids', async () => {
    let res = await agent.delete(`/${org.id}/${subscriber.id}def`)
      .set(tst.jwtHeader(seed.User.current.id))
    expect(res.status).toBe(400)
    expect(res.body.meta.codes).toContain('api.members.destroy.notFound')
  })
  
  it('should fail if deleting the last coordinator', async () => {
    let res = await agent.delete(`/${org.id}/${coordinator.id}`)
      .set(tst.jwtHeader(seed.User.current.id))
    expect(res.status).toBe(400)
    expect(res.body.meta.codes).toContain('api.members.destroy.badDestroy')
  })
  
  it('should fail if deleting the verified last donor', async () => {
    let res = await agent.delete(`/${org.id}/${donor.id}`)
      .set(tst.jwtHeader(seed.User.current.id))
    expect(res.status).toBe(400)
    expect(res.body.meta.codes).toContain('api.members.destroy.badDestroy')
  })
})
