import { applySeed, Seed, mockRoute, Agent, openDb, closeDb, jwtHeader } from '../../../../tools/testHarness'
import create from '../create.route'
import { IModelSet } from '../../../models'
import { MemberRole } from '../../../types'

let db: any
let models: IModelSet
let seed: Seed
let agent: Agent

beforeEach(async () => {
  ({ db, models } = await openDb())
  seed = await applySeed('test/orgs', models)
  agent = mockRoute(create, models, { jwt: true })
})

afterEach(async () => {
  await closeDb(db)
})

describe('orgs.create', () => {
  it('should return the organisation', async () => {
    let res = await agent.post('/')
      .set(jwtHeader(seed.User.verified.id))
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
      .set(jwtHeader(seed.User.verified.id))
      .send({ name: 'New Org', info: 'Some info' })
    let org = await models.Organisation.findOne({ name: 'New Org' })
    expect(org).toBeTruthy()
    expect(org).toHaveProperty('info', 'Some info')
  })
  it('should add the user as a member', async () => {
    await agent.post('/')
      .set(jwtHeader(seed.User.verified.id))
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
      .set(jwtHeader(seed.User.unverified.id))
      .send({ name: 'New Org', info: 'Some info' })
    expect(res.status).toBe(400)
  })
})
