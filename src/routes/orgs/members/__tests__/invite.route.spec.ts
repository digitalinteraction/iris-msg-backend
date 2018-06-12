import * as tst from '../../../../../tools/testHarness'
import invite, { makeMessage } from '../invite.route'
import { IModelSet, IUser, IOrganisation, IMember } from '../../../../models'
import { MemberRole } from '../../../../types'
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
  agent = tst.mockRoute(invite, models, { jwt: true, path: '/:org_id' })
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

async function addMember (org: IOrganisation, user: IUser, role: MemberRole): Promise<IMember> {
  let member = org.members.create({
    role,
    confirmedOn: new Date(),
    deletedOn: null,
    user: user.id
  })
  org.members.push(member)
  await org.save()
  return member
}

describe('orgs.invite', () => {
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
  // it('should reactivate an deleted member', async () => {
  //   seed.Organisation.a.members.push({
  //     role: MemberRole.Donor,
  //     confirmedOn: new Date(),
  //     deletedOn: new Date(),
  //     user: seed.User.verified.id
  //   })
  //   await seed.Organisation.a.save()
  //
  //   await agent.post('/' + seed.Organisation.a.id)
  //     .set(tst.jwtHeader(seed.User.current.id))
  //     .send({
  //       phoneNumber: '07880123002',
  //       locale: 'GB',
  //       role: MemberRole.Donor
  //     })
  //
  //   let org = await models.Organisation.findById(seed.Organisation.a.id)
  //   expect(org!.members[1]).toEqual({
  //     user: seed.User.verified.id,
  //     role: MemberRole.Donor,
  //     deletedOn: expect.any(Date)
  //   })
  // })
})
