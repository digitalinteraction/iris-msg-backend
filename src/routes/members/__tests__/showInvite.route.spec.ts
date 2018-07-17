import * as tst from '@/tools/testHarness'
import showInvite from '../showInvite.route'
import { IModelSet, IOrganisation, IMember } from '@/src/models'
import { MemberRole } from '@/src/types'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

let org: IOrganisation
let member: IMember
let token: string

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/members', models)
  agent = tst.mockRoute(showInvite, models, { path: '/:token' })
  
  org = seed.Organisation.a
  member = org.members.create({
    role: MemberRole.Subscriber,
    confirmedOn: null,
    user: seed.User.current.id
  })
  org.members.push(member)
  await org.save()
  
  token = tst.makeMemberToken(member.id, org.id)
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('orgs.members.showInvite', () => {
  it('should succeed with a http/200', async () => {
    let res = await agent.get(`/${token}`)
    expect(res.status).toBe(200)
  })
  
  it('should return the organisation and member', async () => {
    let res = await agent.get(`/${token}`)
    expect(res.body.data).toBeDefined()
    
    expect(res.body.data.organisation).toBeDefined()
    expect(res.body.data.member).toBeDefined()
    expect(res.body.data.user).toBeDefined()
    
    expect(res.body.data.organisation._id).toBe(org.id)
    expect(res.body.data.member._id).toBe(member.id)
    expect(res.body.data.user._id).toBe(seed.User.current.id)
  })
})
