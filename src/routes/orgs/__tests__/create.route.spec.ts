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
  
  it('should add the user as a coordinator', async () => {
    await agent.post('/')
      .set(tst.jwtHeader(seed.User.verified.id))
      .send({ name: 'New Org', info: 'Some info' })
    let org = await models.Organisation.findOne({ name: 'New Org' })
    
    expect(org).toBeTruthy()
    
    let member = org!.members[0]
    expect(member.user).toEqual(seed.User.verified._id)
    expect(member.role).toBe(MemberRole.Coordinator)
    expect(member.confirmedOn).toBeInstanceOf(Date)
  })
  
  it('should add the user as a donor', async () => {
    await agent.post('/')
      .set(tst.jwtHeader(seed.User.verified.id))
      .send({ name: 'New Org', info: 'Some info' })
    let org = await models.Organisation.findOne({ name: 'New Org' })
    
    expect(org).toBeTruthy()
    
    let member = org!.members[1]
    expect(member.user).toEqual(seed.User.verified._id)
    expect(member.role).toBe(MemberRole.Donor)
    expect(member.confirmedOn).toBeInstanceOf(Date)
  })
  
  it('should fail for unverified users', async () => {
    let res = await agent.post('/')
      .set(tst.jwtHeader(seed.User.unverified.id))
      .send({ name: 'New Org', info: 'Some info' })
    expect(res.status).toBe(400)
  })
  
  it('should fail with a long name', async () => {
    let longName = 'An organisation with a really really really long name'
    let res = await agent.post('/')
      .set(tst.jwtHeader(seed.User.verified.id))
      .send({ name: longName, info: 'Some info' })
    expect(res.status).toBe(400)
  })
  
  it('should fail with a long info', async () => {
    let longInfo = 'Aenean lacinia bibendum nulla sed consectetur. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit.'
    
    let res = await agent.post('/')
      .set(tst.jwtHeader(seed.User.verified.id))
      .send({ name: 'New Org', info: longInfo })
    expect(res.status).toBe(400)
  })
})
