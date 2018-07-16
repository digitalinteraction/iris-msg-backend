import * as tst from '@/tools/testHarness'
import unsubscribe from '../unsubscribe.route'
import { IModelSet, IOrganisation, IMember } from '@/src/models'
import { MemberRole } from '@/src/types'
import { sign } from 'jsonwebtoken'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

let org: IOrganisation
let member: IMember
let token: string

function makeUnsubToken (mem: string, org: string): string {
  return sign({ mem, org }, process.env.JWT_SECRET!)
}

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/members', models)
  agent = tst.mockRoute(unsubscribe, models, {
    path: '/:token'
  })
  
  org = seed.Organisation.a
  member = tst.addMember(org, seed.User.current, MemberRole.Subscriber)
  org.members.push(member)
  await org.save()
  
  token = tst.makeMemberToken(member.id, org.id)
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('orgs.members.unsubscribe', () => {
  it('should succeed with a http/200', async () => {
    let res = await agent.get(`/${token}`)
    expect(res.status).toBe(200)
  })
  
  it('should unsubscribe the member', async () => {
    await agent.get(`/${token}`)
    
    let updatedOrg = await models.Organisation.findById(org.id)
    let updatedMem = updatedOrg!.members.id(member.id)
    
    expect(updatedMem.deletedOn).toBeInstanceOf(Date)
  })
  
  it('should only remove subscribers', async () => {
    member = tst.addMember(
      org, seed.User.current, MemberRole.Coordinator
    )
    await org.save()
    
    token = makeUnsubToken(member.id, org.id)
    let res = await agent.get(`/${token}`)
    
    expect(res.status).toBe(400)
  })
  
  it('should handle bad jwts', async () => {
    let res = await agent.get(`/abcdef`)
    expect(res.status).toBe(400)
    expect(res.text).toContain('api.members.unsubscribe.notFound')
  })
})
