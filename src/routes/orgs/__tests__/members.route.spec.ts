import * as tst from '../../../../tools/testHarness'
import members from '../members.route'
import { IModelSet, IOrganisation } from '../../../models'
import { MemberRole } from '../../../types'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

let org: IOrganisation

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/orgs', models)
  agent = tst.mockRoute(members, models, { jwt: true, path: '/:org_id' })
  
  org = seed.Organisation.a
  
  let users = await models.User.create([
    { phoneNumber: '123', verifiedOn: new Date() },
    { phoneNumber: '456', verifiedOn: new Date() },
    { phoneNumber: '789', verifiedOn: new Date() }
  ])
  
  tst.addMember(org, seed.User.verified, MemberRole.Coordinator)
  tst.addMember(org, users[0], MemberRole.Donor)
  tst.addMember(org, users[1], MemberRole.Subscriber)
  tst.addMember(org, users[2], MemberRole.Subscriber, { confirmedOn: null })
  
  await org.save()
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('orgs.members', () => {
  it('should return an organisation\'s verified members', async () => {
    let res = await agent.get('/' + org.id)
      .set(tst.jwtHeader(seed.User.verified))
    expect(res.body.data).toHaveLength(3)
  })
  it('should embed user info', async () => {
    let res = await agent.get('/' + org.id)
      .set(tst.jwtHeader(seed.User.verified))
    
    res.body.data.forEach((member: any) => {
      expect(member).toMatchObject({
        phoneNumber: expect.any(String),
        locale: expect.any(String)
      })
    })
  })
})
