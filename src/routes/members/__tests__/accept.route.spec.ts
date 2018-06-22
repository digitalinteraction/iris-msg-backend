import * as tst from '@/tools/testHarness'
import accept from '../accept.route'
import { IModelSet, IOrganisation, IMember } from '@/src/models'
import { MemberRole } from '@/src/types'
import { verify } from 'jsonwebtoken'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

let org: IOrganisation
let member: IMember

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/members', models)
  agent = tst.mockRoute(accept, models, {
    jwt: true, path: '/:mem_id'
  })
  
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

describe('orgs.members.accept', () => {
  it('should succeed with a http/200', async () => {
    let res = await agent.post(`/${member.id}`)
      .set(tst.jwtHeader(seed.User.current.id))
    
    expect(res.status).toBe(200)
  })
  
  it('should mark the member as confirmed', async () => {
    await agent.post(`/${member.id}`)
      .set(tst.jwtHeader(seed.User.current.id))
    
    let updatedOrg = await models.Organisation.findById(org.id)
    let updatedMem = updatedOrg!.members.id(member.id)
    
    expect(updatedMem.confirmedOn).toBeInstanceOf(Date)
  })
  
  it('should return a UserAuth', async () => {
    let res = await agent.post(`/${member.id}`)
      .set(tst.jwtHeader(seed.User.current.id))
    
    expect(res.body.data.token).toBeDefined()
    let payload = verify(res.body.data.token, process.env.JWT_SECRET!) as any
    expect(payload.usr).toBe(seed.User.current.id)
  })
  
  it('should fail gracefully for bad mongo ids', async () => {
    let res = await agent.post(`/${member.id}abcdef`)
      .set(tst.jwtHeader(seed.User.current.id))
    
    expect(res.status).toBe(400)
    expect(res.body.meta.messages).toContain('api.members.accept.notFound')
  })
})
