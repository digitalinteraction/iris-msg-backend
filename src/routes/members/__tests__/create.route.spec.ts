import * as tst from '@/tools/testHarness'
import create, { makeMessage } from '../create.route'
import { IModelSet } from '@/src/models'
import { MemberRole } from '@/src/types'
import { Response } from 'superagent'
import twilio = require('twilio')

jest.mock('twilio')

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent
let sentMessages: any[]

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/members', models)
  agent = tst.mockRoute(create, models, { jwt: true, path: '/:org_id' })
  sentMessages = (twilio as any)().__resetMessages()
  
  seed.Organisation.a.members.push({
    role: MemberRole.Coordinator,
    confirmedOn: new Date(),
    user: seed.User.current.id
  })
  await seed.Organisation.a.save()
})

afterEach(async () => {
  await tst.closeDb(db)
})

async function inviteMember (phoneNumber: string, role: MemberRole): Promise<Response> {
  return agent.post('/' + seed.Organisation.a.id)
    .set(tst.jwtHeader(seed.User.current.id))
    .send({ phoneNumber, role, locale: 'GB' })
}

describe('orgs.members.invite', () => {
  it('should add a verified subscriber', async () => {
    let res = await inviteMember('07880123002', MemberRole.Subscriber)
    
    expect(res.status).toBe(200)
    
    let org = await models.Organisation.findById(seed.Organisation.a.id)
    expect(org!.members[1]).toMatchObject({
      user: seed.User.verified._id,
      confirmedOn: expect.any(Date),
      role: MemberRole.Subscriber
    })
  })
  
  it('should add an unverified subscriber', async () => {
    let res = await inviteMember('07880123002', MemberRole.Donor)
    
    expect(res.status).toBe(200)
    
    let org = await models.Organisation.findById(seed.Organisation.a.id)
    expect(org!.members[1]).toMatchObject({
      user: seed.User.verified._id,
      confirmedOn: null,
      role: MemberRole.Donor
    })
  })
  
  it('should create a verified user if not found', async () => {
    await inviteMember('07880123004', MemberRole.Subscriber)
    
    let user = await models.User.findOne({
      phoneNumber: '+447880123004'
    })
    
    expect(user).toBeTruthy()
    expect(user!.verifiedOn).toEqual(expect.any(Date))
  })
  
  it('should send the user a sms', async () => {
    await inviteMember('07880123002', MemberRole.Subscriber)
    expect(sentMessages).toHaveLength(1)
  })
  
  it('should fail if already a member', async () => {
    let org = seed.Organisation.a
    tst.addMember(org, seed.User.verified, MemberRole.Donor)
    await org.save()
    let res = await inviteMember('07880123002', MemberRole.Donor)
    expect(res.status).toBe(400)
  })
  
  describe('#makeMessage', () => {
    it('should add an unsub link for subscribers', async () => {
      let memberId = 'fake-id'
      let message = makeMessage(MemberRole.Subscriber, 'Fake Org', memberId)
      expect(message).toContain('http://localhost:3000/unsub/fake-id')
    })
    
    it('should add a accept link for donors', async () => {
      let memberId = 'fake-id'
      let message = makeMessage(MemberRole.Donor, 'Fake Org', memberId)
      expect(message).toContain('http://localhost:3000/accept/fake-id')
    })
  })
})
