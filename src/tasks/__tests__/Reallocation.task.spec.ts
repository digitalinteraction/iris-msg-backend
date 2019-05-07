import { ReallocationTask, ReallocationContext } from '../Reallocation.task'

import * as tst from '@/tools/testHarness'
import { IModelSet, IMessage } from '@/src/models'
import { MemberRole, MessageAttemptState } from '@/src/types'

import firebase from 'firebase-admin'
import twilio from 'twilio'

jest.mock('firebase-admin')
jest.mock('twilio')

let db: any
let models: IModelSet
let seed: tst.Seed

let task: ReallocationTask
let msg: IMessage

let sentFcm: any[]
let sentSms: any[]
let ctx: ReallocationContext

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/messages', models)
  
  let org = seed.Organisation.a
  
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
  
  await org.save()
  
  sentFcm = (firebase as any).__resetMessages()
  sentSms = (twilio as any)().__resetMessages()
  
  msg = await models.Message.create({
    content: 'Hello, World!',
    author: seed.User.current.id,
    organisation: org.id,
    attempts: [
      {
        createdAt: tst.inThePast,
        state: MessageAttemptState.Pending,
        recipient: seed.User.subA.id,
        donor: seed.User.donorA.id
      }
    ]
  })
  
  task = new ReallocationTask()
  
  let log = tst.mockLog()
  let i18n = tst.mockI18n()
  ctx = { models, log, i18n }
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('ReallocationTask', () => {
  it('should mark the previos attempt as NoResponse', async () => {
    await task.run(ctx)
  
    let updatedMessage = await models.Message.findById(msg.id)
    let prevAttempt = updatedMessage!.attempts[0]
  
    expect(prevAttempt.state).toEqual(MessageAttemptState.NoResponse)
  })
  
  it('should reallocate the task to another donor', async () => {
    
    await task.run(ctx)
    
    let updatedMessage = await models.Message.findById(msg.id)
    let nextAttempt = updatedMessage!.attempts[1]
    
    expect(updatedMessage!.attempts).toHaveLength(2)
    expect(nextAttempt.state).toBe(MessageAttemptState.Pending)
    expect(nextAttempt.donor).toEqual(seed.User.donorB._id)
    
    let [ first, second ] = updatedMessage!.attempts
    expect(second).toHaveProperty('previousAttempt', first._id)
  })
  
  it('should send the new donor an fcm', async () => {
    await task.run(ctx)
    
    expect(sentFcm).toHaveLength(1)
    expect(sentFcm[0].token).toEqual('abcdefg-123456-3')
  })
  it('should fallback to Twilio', async () => {
    msg.attempts[0].state = MessageAttemptState.Failed
    msg.attempts.push({
      createdAt: tst.inThePast,
      state: MessageAttemptState.Pending,
      recipient: seed.User.subA.id,
      donor: seed.User.donorB
    })
    
    await msg.save()
    
    await task.run(ctx)
    
    let updatedMessage = await models.Message.findById(msg.id)
    
    expect(sentSms).toHaveLength(1)
    expect(updatedMessage!.attempts).toHaveLength(3)
    
    let [ , second, third ] = updatedMessage!.attempts
    expect(third).toHaveProperty('previousAttempt', second._id)
  })
  it('should not reallocate young attempts', async () => {
    msg.attempts.push({
      state: MessageAttemptState.Pending,
      recipient: seed.User.subB.id,
      donor: seed.User.donorB
    })
  })
})
