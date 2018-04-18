import * as tst from '../../../../../tools/testHarness'
import invite from '../invite.route'
import * as models from '../../../../models'
import { MemberRole } from '../../../../types'
import twilio = require('twilio')

jest.mock('twilio')

let db: any
let seed: tst.Seed
let agent: tst.Agent
let sentMessages: any[]

beforeEach(async () => {
  db = await tst.openDb()
  seed = await tst.applySeed('test/members', models)
  agent = tst.mockRoute(invite, models, { jwt: true, path: '/:id' })
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

describe('orgs.invite', () => {
  it('should add a verified subscriber', async () => {
    let res = await agent.post('/' + seed.Organisation.a.id)
      .set(tst.jwtHeader(seed.User.current.id))
      .send({
        phoneNumber: '07880123002',
        locale: 'GB',
        role: MemberRole.Subscriber
      })
    
    expect(res.status).toBe(200)
    
    let org = await models.Organisation.findById(seed.Organisation.a.id)
    expect(org!.members[1]).toMatchObject({
      user: seed.User.verified._id,
      confirmedOn: expect.any(Date),
      role: MemberRole.Subscriber
    })
  })
  it('should add an unverified subscriber', async () => {
    let res = await agent.post('/' + seed.Organisation.a.id)
      .set(tst.jwtHeader(seed.User.current.id))
      .send({
        phoneNumber: '07880123002',
        locale: 'GB',
        role: MemberRole.Donor
      })
    
    expect(res.status).toBe(200)
    
    let org = await models.Organisation.findById(seed.Organisation.a.id)
    expect(org!.members[1]).toMatchObject({
      user: seed.User.verified._id,
      confirmedOn: null,
      role: MemberRole.Donor
    })
  })
  it('should create a verified user if not found', async () => {
    await agent.post('/' + seed.Organisation.a.id)
      .set(tst.jwtHeader(seed.User.current.id))
      .send({
        phoneNumber: '07880123004',
        locale: 'GB',
        role: MemberRole.Subscriber
      })
    
    let user = await models.User.findOne({
      phoneNumber: '+447880123004'
    })
    
    expect(user).toBeTruthy()
    expect(user!.verifiedOn).toEqual(expect.any(Date))
  })
  it('should send the user a sms', async () => {
    await agent.post('/' + seed.Organisation.a.id)
      .set(tst.jwtHeader(seed.User.current.id))
      .send({
        phoneNumber: '07880123004',
        locale: 'GB',
        role: MemberRole.Subscriber
      })
    
    expect(sentMessages).toHaveLength(1)
  })
})
