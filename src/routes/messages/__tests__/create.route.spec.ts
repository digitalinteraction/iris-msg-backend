import * as tst from '@/tools/testHarness'
import create from '../create.route'
import { IModelSet, IOrganisation } from '@/src/models'
import { MemberRole, FcmType } from '@/src/types'
import { Response } from 'supertest'
import firebase from 'firebase-admin'

jest.mock('firebase-admin')

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

let org: IOrganisation
let sentFcm: any[]

function sendMessage (content: string, orgId: any): Promise<Response> {
  return agent.post('/')
    .set(tst.jwtHeader(seed.User.current.id))
    .send({ content, orgId })
}

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/messages', models)
  agent = tst.mockRoute(create, models, { jwt: true })
  
  org = seed.Organisation.a
  sentFcm = (firebase as any).__resetMessages()
  
  tst.addMember(org, seed.User.current, MemberRole.Coordinator)
  
  tst.addMember(org, seed.User.donorA, MemberRole.Donor)
  tst.addMember(org, seed.User.donorB, MemberRole.Donor)
  tst.addMember(org, seed.User.donorC, MemberRole.Donor, {
    confirmedOn: null
  })
  tst.addMember(org, seed.User.donorD, MemberRole.Donor, {
    deletedOn: new Date()
  })
  
  tst.addMember(org, seed.User.subA, MemberRole.Subscriber)
  tst.addMember(org, seed.User.subB, MemberRole.Subscriber)
  tst.addMember(org, seed.User.subC, MemberRole.Subscriber)
  tst.addMember(org, seed.User.subD, MemberRole.Subscriber)
  
  await org.save()
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('messages.create', () => {
  it('should succeed with http/200', async () => {
    let res = await agent.post('/')
      .set(tst.jwtHeader(seed.User.current.id))
      .send({ content: 'Hey', orgId: org.id })
    
    expect(res.status).toBe(200)
  })
  it('should create a message record', async () => {
    await sendMessage('Hey', org.id)
    
    let messages = await models.Message.find()
    expect(messages).toHaveLength(1)
  })
  it('should allocate message attempts to active donors', async () => {
    await sendMessage('Hey', org.id)
    
    let message = await models.Message.findOne()
    expect(message!.attempts).toHaveLength(4)
  })
  it('should send an fcm to allocated donors', async () => {
    await sendMessage('Hey', org.id)
    
    expect(sentFcm).toHaveLength(2)
    expect(sentFcm[0]).toMatchObject({
      token: expect.any(String),
      data: { type: FcmType.NewDonations }
    })
    let [ fcm ] = sentFcm
    expect(fcm.notification.title).toContain('en:fcm.new_donations.title')
    expect(fcm.notification.body).toContain('en:fcm.new_donations.body')
  })
  it('should only send fcm to donors which have been used', async () => {
    org = seed.Organisation.b
    
    tst.addMember(org, seed.User.current, MemberRole.Coordinator)
    
    tst.addMember(org, seed.User.donorA, MemberRole.Donor)
    tst.addMember(org, seed.User.donorB, MemberRole.Donor)
    
    tst.addMember(org, seed.User.subA, MemberRole.Subscriber)
    
    await org.save()
    
    let res = await agent.post('/')
      .set(tst.jwtHeader(seed.User.current))
      .send({ content: 'Hey', orgId: org.id })
    
    expect(sentFcm).toHaveLength(1)
  })
})
