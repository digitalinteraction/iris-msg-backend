import * as tst from '@/tools/testHarness'
import acceptInvite from '../acceptInvite.route'
import { IModelSet, IOrganisation, IMember } from '@/src/models'
import { MemberRole } from '@/src/types'
import { verify } from 'jsonwebtoken'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

let org: IOrganisation
let member: IMember
let token: string

beforeEach(async () => {
  ;({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/members', models)
  agent = tst.mockRoute(acceptInvite, models, { path: '/:token' })

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

describe('orgs.members.acceptInvite', () => {
  it('should succeed with a http/200', async () => {
    let res = await agent.post(`/${token}`)

    expect(res.status).toBe(200)
  })

  it('should mark the member as confirmed', async () => {
    await agent.post(`/${token}`)

    let updatedOrg = await models.Organisation.findById(org.id)
    let updatedMem = updatedOrg!.members.id(member.id)

    expect(updatedMem.confirmedOn).toBeInstanceOf(Date)
  })

  it('should return a UserAuth', async () => {
    let res = await agent.post(`/${token}`)

    expect(res.body.data.token).toBeDefined()
    let payload = verify(res.body.data.token, process.env.JWT_SECRET!) as any
    expect(payload.usr).toBe(seed.User.current.id)
  })

  it('should fail gracefully for bad mongo ids', async () => {
    let res = await agent.post(`/${token}abcdef`)

    expect(res.status).toBe(400)
    expect(res.body.meta.codes).toContain('api.members.accept.notFound')
  })

  it('should return the organisation', async () => {
    let res = await agent.post(`/${token}`)

    expect(res.body.data.organisation).toBeDefined()
    expect(res.body.data.organisation._id).toBe(org.id)
  })
})
