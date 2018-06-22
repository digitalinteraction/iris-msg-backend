import * as tst from '@/tools/testHarness'
import unsubscribe from '../unsubscribe.route'
import { IModelSet, IOrganisation, IMember } from '@/src/models'
import { MemberRole } from '@/src/types'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

let org: IOrganisation
let member: IMember

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/members', models)
  agent = tst.mockRoute(unsubscribe, models, {
    jwt: true, path: '/:mem_id'
  })
  
  org = seed.Organisation.a
  member = tst.addMember(org, seed.User.current, MemberRole.Subscriber)
  org.members.push(member)
  await org.save()
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('orgs.members.unsubscribe', () => {
  it('should succeed with a http/200', async () => {
    let res = await agent.post(`/${member.id}`)
      .set(tst.jwtHeader(seed.User.current.id))
    expect(res.status).toBe(200)
  })
  
  it('should unsubscribe the member', async () => {
    await agent.post(`/${member.id}`)
      .set(tst.jwtHeader(seed.User.current.id))
    
    let updatedOrg = await models.Organisation.findById(org.id)
    let updatedMem = updatedOrg!.members.id(member.id)
    
    expect(updatedMem.deletedOn).toBeInstanceOf(Date)
  })
  
  it('should only remove subscribers', async () => {
    member = tst.addMember(
      org, seed.User.current, MemberRole.Coordinator
    )
    await org.save()
    
    let res = await agent.post(`/${member.id}`)
      .set(tst.jwtHeader(seed.User.current.id))
    
    expect(res.status).toBe(400)
  })
  
  it('should handle bad mongo ids', async () => {
    let res = await agent.post(`/${member.id}abcdef`)
      .set(tst.jwtHeader(seed.User.current.id))
    expect(res.status).toBe(400)
    expect(res.text).toContain('api.members.unsubscribe.notFound')
  })
})
