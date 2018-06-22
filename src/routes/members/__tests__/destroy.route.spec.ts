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
  tst.addMember(
    org, seed.User.current, MemberRole.Coordinator
  )
  subscriber = tst.addMember(
    org, seed.User.verified, MemberRole.Subscriber
  )
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
    expect(res.body.meta.messages).toContain('api.members.destroy.notFound')
  })
  
  it('should fail gracefully for bad mem_ids', async () => {
    let res = await agent.delete(`/${org.id}/${subscriber.id}def`)
      .set(tst.jwtHeader(seed.User.current.id))
    expect(res.status).toBe(400)
    expect(res.body.meta.messages).toContain('api.members.destroy.notFound')
  })
})
