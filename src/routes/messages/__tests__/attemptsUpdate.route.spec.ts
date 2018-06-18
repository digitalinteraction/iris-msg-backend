import * as tst from '@/tools/testHarness'
import { MemberRole, MessageAttemptState } from '@/src/types'
import attemptsUpdate from '../attemptsUpdate.route'
import { IModelSet, IOrganisation, IMessage, makeModels } from '@/src/models'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

let org: IOrganisation
let msg: IMessage

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/messages', models)
  agent = tst.mockRoute(attemptsUpdate, models, { jwt: true })
  
  org = seed.Organisation.a
  
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
        donor: seed.User.donorA
      }
    ]
  })
  
  await org.save()
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('messages.attempts_update', () => {
  it('should succeed with http/200', async () => {
    let res = await agent.post('/')
      .set(tst.jwtHeader(seed.User.donorA))
      .set({ attempts: [
      ]})
    expect(res.status).toBe(200)
  })
  it('should reallocate to a new donor', async () => {
    await agent.post('/')
      .set(tst.jwtHeader(seed.User.donorA))
    
    let updatedMessage = await models.Message.findById(msg.id)
    
    expect(updatedMessage!.attempts).toHaveLength(2)
  })
})
