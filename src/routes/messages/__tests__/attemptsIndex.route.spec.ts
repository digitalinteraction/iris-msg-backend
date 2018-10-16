import * as tst from '@/tools/testHarness'
import attemptsIndex from '../attemptsIndex.route'
import { IModelSet, IOrganisation, IUser, IMessage } from '@/src/models'
import { MemberRole, MessageAttemptState } from '@/src/types'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

let org: IOrganisation
let msg: IMessage

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/messages', models)
  agent = tst.mockRoute(attemptsIndex, models, { jwt: true })
  
  org = seed.Organisation.a
  
  tst.addMember(org, seed.User.current, MemberRole.Coordinator)
  
  tst.addMember(org, seed.User.donorA, MemberRole.Donor)
  tst.addMember(org, seed.User.donorB, MemberRole.Donor)
  
  // tst.addMember(org, seed.User.subA, MemberRole.Subscriber)
  // tst.addMember(org, seed.User.subB, MemberRole.Subscriber)
  // tst.addMember(org, seed.User.subC, MemberRole.Subscriber)
  // tst.addMember(org, seed.User.subD, MemberRole.Subscriber)
  
  msg = await models.Message.create({
    content: 'Hey there!',
    organisation: org.id,
    author: seed.User.current.id,
    attempts: [
      {
        state: MessageAttemptState.Pending,
        recipient: seed.User.subA.id,
        donor: seed.User.donorA.id
      },
      {
        state: MessageAttemptState.Pending,
        recipient: seed.User.subB.id,
        donor: seed.User.donorA.id
      },
      {
        state: MessageAttemptState.Success,
        recipient: seed.User.subC.id,
        donor: seed.User.donorA.id
      },
      {
        state: MessageAttemptState.Pending,
        recipient: seed.User.subD.id,
        donor: seed.User.donorB.id
      }
    ]
  })
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('messages.attempts_index', () => {
  it('should succeed with http/200', async () => {
    let res = await agent.get('/')
      .set(tst.jwtHeader(seed.User.current.id))
    expect(res.status).toBe(200)
  })
  it('should return the attempts for the message', async () => {
    let res = await agent.get('/')
      .set(tst.jwtHeader(seed.User.donorA.id))
    
    // Check the structure of the message
    expect(res.body.data).toBeInstanceOf(Array)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0]).toMatchObject({
      content: 'Hey there!',
      organisation: expect.any(Object),
      author: seed.User.current.id
    })
    
    // Check the attempts were formatted
    let attempts = res.body.data[0].attempts
    expect(attempts).toBeInstanceOf(Array)
    expect(attempts).toHaveLength(2)
    expect(attempts).toContainEqual({
      _id: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      recipient: expect.anything(),
      phoneNumber: '+447880123010'
    })
    expect(attempts).toContainEqual({
      _id: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      recipient: expect.anything(),
      phoneNumber: '+447880123011'
    })
  })
  it('should embed organisations', async () => {
    let res = await agent.get('/')
      .set(tst.jwtHeader(seed.User.donorA.id))
    
    let msg = res.body.data[0]
    expect(msg.organisation._id).toBe(org.id)
    expect(msg.organisation.name).toBe(org.name)
  })
  it('should ignore twilio attempts', async () => {
    msg.attempts.push({
      state: MessageAttemptState.Twilio,
      recipient: seed.User.subA.id,
      donor: null
    })
    await msg.save()
    
    let res = await agent.get('/')
      .set(tst.jwtHeader(seed.User.donorA.id))
    
    expect(res.status).toBe(200)
  })
})
