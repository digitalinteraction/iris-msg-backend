import { applySeed, Seed, mockRoute, Agent, openDb, closeDb, jwtHeader } from '../../../../tools/testHarness'
import show from '../show.route'
import { IModelSet } from '../../../models'
import { MemberRole } from '../../../types'
import { Model } from 'mongoose'

let db: any
let models: IModelSet
let seed: Seed
let agent: Agent

async function pushMember (org: any, args: any) {
  org.members.push(args)
  await org.save()
}

beforeEach(async () => {
  ({ db, models } = await openDb())
  seed = await applySeed('test/orgs', models)
  agent = mockRoute(show, models, { jwt: true, path: '/:org_id' })
})

afterEach(async () => {
  await closeDb(db)
})

describe('orgs.show', () => {
  it('should return an organisation that you are in', async () => {
    await pushMember(seed.Organisation.a, {
      user: seed.User.verified.id,
      role: MemberRole.Coordinator,
      confirmedOn: new Date()
    })
    
    let res = await agent.get('/' + seed.Organisation.a.id)
      .set(jwtHeader(seed.User.verified.id))
    
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty('name', 'Existing A')
  })
  it('should fail for unverified users', async () => {
    await pushMember(seed.Organisation.a, {
      user: seed.User.unverified.id,
      role: MemberRole.Coordinator,
      confirmedOn: new Date()
    })
    
    let res = await agent.get('/' + seed.Organisation.a.id)
      .set(jwtHeader(seed.User.unverified.id))
    
    expect(res.status).toBe(400)
    expect(res.body.data).toBeNull()
  })
})
