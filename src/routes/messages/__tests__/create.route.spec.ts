import * as tst from '@/tools/testHarness'
import create from '../create.route'
import { IModelSet, IOrganisation, IUser } from '@/src/models'
import { MemberRole } from '@/src/types'
import { Response } from 'supertest'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

let org: IOrganisation

const inThePast = new Date('2013-09-25T16:00:00.1Z')

function addMember (org: IOrganisation, user: IUser, role: MemberRole, extras: any = {}) {
  org.members.push({
    role: role,
    user: user.id,
    confirmedOn: inThePast,
    ...extras
  })
}

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
  addMember(org, seed.User.current, MemberRole.Coordinator)
  
  addMember(org, seed.User.donorA, MemberRole.Donor)
  addMember(org, seed.User.donorB, MemberRole.Donor)
  addMember(org, seed.User.donorC, MemberRole.Donor, {
    confirmedOn: null
  })
  addMember(org, seed.User.donorD, MemberRole.Donor, {
    deletedOn: new Date()
  })
  
  addMember(org, seed.User.subA, MemberRole.Subscriber)
  addMember(org, seed.User.subB, MemberRole.Subscriber)
  addMember(org, seed.User.subC, MemberRole.Subscriber)
  addMember(org, seed.User.subD, MemberRole.Subscriber)
  
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
    let res = await sendMessage('Hey', org.id)
    
    let messages = await models.Message.find()
    expect(messages).toHaveLength(1)
  })
})
