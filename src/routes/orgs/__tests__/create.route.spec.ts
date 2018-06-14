import * as tst from '@/tools/testHarness'
import create from '../create.route'
import { IModelSet } from '@/src/models'
import { MemberRole } from '@/src/types'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/orgs', models)
  agent = tst.mockRoute(create, models, { jwt: true })
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('orgs.create', () => {
  it('should return the organisation', async () => {
    let res = await agent.post('/')
      .set(tst.jwtHeader(seed.User.verified.id))
      .send({ name: 'New Org', info: 'Some info' })
    
    expect(res.status).toBe(200)
    expect(res.body.data).toMatchObject({
      _id: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      name: 'New Org',
      info: 'Some info'
    })
  })
  
  it('should create an organisation', async () => {
    await agent.post('/')
      .set(tst.jwtHeader(seed.User.verified.id))
      .send({ name: 'New Org', info: 'Some info' })
    
    let org = await models.Organisation.findOne({ name: 'New Org' })
    expect(org).toBeTruthy()
    expect(org).toHaveProperty('info', 'Some info')
  })
  
  it('should add the user as a member', async () => {
    await agent.post('/')
      .set(tst.jwtHeader(seed.User.verified.id))
      .send({ name: 'New Org', info: 'Some info' })
    let org = await models.Organisation.findOne({ name: 'New Org' })
    expect(org).toBeTruthy()
    expect(org!.members).toHaveLength(1)
    expect(org!.members[0].user).toEqual(seed.User.verified._id)
    expect(org!.members[0].role).toBe(MemberRole.Coordinator)
    expect(org!.members[0].confirmedOn).toBeTruthy()
  })
  
  it('should fail for unverified users', async () => {
    let res = await agent.post('/')
      .set(tst.jwtHeader(seed.User.unverified.id))
      .send({ name: 'New Org', info: 'Some info' })
    expect(res.status).toBe(400)
  })
})
