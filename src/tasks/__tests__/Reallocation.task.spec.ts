import { ReallocationTask } from '../Reallocation.task'

import * as tst from '@/tools/testHarness'
import { IModelSet, IOrganisation, IMessage } from '@/src/models'
import { MemberRole, MessageAttemptState } from '@/src/types'

import firebase = require('firebase-admin')
import twilio = require('twilio')

jest.mock('firebase-admin')
jest.mock('twilio')

let db: any
let models: IModelSet
let seed: tst.Seed

let task: ReallocationTask
let msg: IMessage

let sentFcm: any[]
let sentSms: any[]

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
  
  await org.save()
  
  sentFcm = (firebase as any).__resetMessages()
  sentSms = (twilio as any)().__resetMessages()
  
  msg = await models.Message.create({
    content: 'Hello, World!',
    author: seed.User.current.id,
    organisation: org.id,
    attempts: [
      {
        state: MessageAttemptState.Pending,
        recipient: seed.User.subA.id,
        donor: seed.User.donorA.id
      }
    ]
  })
  
  task = new ReallocationTask()
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('ReallocationTask', () => {
  it('should mark the previos attempt as NoResponse', async () => {
    await task.run({ models })
  
    let updatedMessage = await models.Message.findById(msg.id)
    let prevAttempt = updatedMessage!.attempts[0]
  
    expect(prevAttempt.state).toEqual(MessageAttemptState.NoResponse)
  })
  
  it('should reallocate the task to another donor', async () => {
    
    await task.run({ models })
  
    let updatedMessage = await models.Message.findById(msg.id)
    let nextAttempt = updatedMessage!.attempts[1]
  
    expect(updatedMessage!.attempts).toHaveLength(2)
    expect(nextAttempt.state).toBe(MessageAttemptState.Pending)
    expect(nextAttempt.donor).toEqual(seed.User.donorB._id)
  })
  
  it('should send the new donor an fcm', async () => {
    await task.run({ models })
  
    expect(sentFcm).toHaveLength(1)
  })
  it('should fallback to Twilio', async () => {
    await task.run({ models })
    await task.run({ models })
    
    expect(sentSms).toHaveLength(1)
  })
})
