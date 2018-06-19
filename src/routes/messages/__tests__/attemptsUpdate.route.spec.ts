import * as tst from '@/tools/testHarness'
import { MemberRole, MessageAttemptState } from '@/src/types'
import attemptsUpdate from '../attemptsUpdate.route'
import {
  IModelSet, IOrganisation, IMessage, IMessageAttempt, IUser, makeModels
} from '@/src/models'
import { Response } from 'superagent'

import firebase = require('firebase-admin')
import twilio = require('twilio')

jest.mock('firebase-admin')
jest.mock('twilio')

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

let msg: IMessage

let sentFcm: any[]
let sentSms: any[]

async function sendUpdate (
  asUser: IUser, attempt: IMessageAttempt, newState: MessageAttemptState
): Promise<Response> {
  return agent.post('/')
    .set(tst.jwtHeader(asUser))
    .send({
      updates: [
        { newState, attempt: attempt.id }
      ]
    })
}

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/messages', models)
  agent = tst.mockRoute(attemptsUpdate, models, { jwt: true })
  
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
  
  sentFcm = (firebase as any).__resetMessages()
  sentSms = (twilio as any)().__resetMessages()
  
  await org.save()
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('messages.attempts_update', () => {
  it('should succeed with http/200', async () => {
    let res = await sendUpdate(
      seed.User.donorA, msg.attempts[0], MessageAttemptState.Rejected
    )
    expect(res.body.meta.messages).toEqual([])
    expect(res.status).toBe(200)
  })
  it('should reallocate to a new donor', async () => {
    await sendUpdate(
      seed.User.donorA, msg.attempts[0], MessageAttemptState.Rejected
    )
    
    let updatedMessage = await models.Message.findById(msg.id)
    expect(updatedMessage!.attempts).toHaveLength(2)
    
    let [ first, second ] = updatedMessage!.attempts
    expect(first.state).toEqual(MessageAttemptState.Rejected)
    expect(second.state).toEqual(MessageAttemptState.Pending)
  })
  it('should send the donor an fcm', async () => {
    await sendUpdate(
      seed.User.donorA, msg.attempts[0], MessageAttemptState.Rejected
    )
    expect(sentFcm).toHaveLength(1)
  })
  it('should fall back to twilio when no active donors', async () => {
    msg.attempts.push({
      state: MessageAttemptState.Failed,
      recipient: seed.User.subA.id,
      donor: seed.User.donorB
    })
    await msg.save()
    
    await sendUpdate(
      seed.User.donorA, msg.attempts[0], MessageAttemptState.Rejected
    )
    
    let updatedMessage = await models.Message.findById(msg.id)
    expect(updatedMessage!.attempts).toHaveLength(3)
    
    let twilio = updatedMessage!.attempts[2]
    
    expect(twilio.state).toBe(MessageAttemptState.Twilio)
    
    expect(sentSms).toHaveLength(1)
  })
  // it('should not realloc for unaccesible orgs', async () => {})
})
