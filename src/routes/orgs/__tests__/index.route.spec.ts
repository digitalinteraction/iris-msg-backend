import { applySeed, Seed, mockRoute, Agent, openDb, closeDb, jwtHeader } from '../../../../tools/testHarness'
import index from '../index.route'
import * as models from '../../../models'
import { MemberRole } from '../../../types'
import { Model } from 'mongoose'

let db: any
let seed: Seed
let agent: Agent

async function pushMember (org: any, args: any) {
  org.members.push(args)
  await org.save()
}

beforeEach(async () => {
  db = await openDb()
  seed = await applySeed('test/orgs', models)
  agent = mockRoute(index, models, { jwt: true })
})

afterEach(async () => {
  await closeDb(db)
})

describe('orgs.index', () => {
  it('should return organisations you belong to', async () => {
    await pushMember(seed.Organisation.a, {
      user: seed.User.verified.id,
      role: MemberRole.Coordinator,
      confirmedOn: new Date()
    })
    
    let res = await agent.get('/')
      .set(jwtHeader(seed.User.verified.id))
    
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
  })
  it('should return nothing for unverified users', async () => {
    await pushMember(seed.Organisation.a, {
      user: seed.User.unverified.id,
      role: MemberRole.Coordinator,
      confirmedOn: new Date()
    })
    
    let res = await agent.get('/')
      .set(jwtHeader(seed.User.unverified.id))
    
    expect(res.status).toBe(200)
    expect(res.body.data).toEqual([])
  })
})
