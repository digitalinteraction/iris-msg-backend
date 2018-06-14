import * as tst from '@/tools/testHarness'
import destroy from '../destroy.route'
import { IModelSet } from '@/src/models'
import { MemberRole } from '@/src/types'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent

async function pushMember (org: any, args: any) {
  org.members.push(args)
  await org.save()
}

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/orgs', models)
  agent = tst.mockRoute(destroy, models, { jwt: true, path: '/:org_id' })
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('orgs.destroy', () => {
  it('should soft-delete the organisation', async () => {
    await pushMember(seed.Organisation.a, {
      user: seed.User.verified.id,
      role: MemberRole.Coordinator,
      confirmedOn: new Date()
    })
    
    let res = await agent.del('/' + seed.Organisation.a.id)
      .set(tst.jwtHeader(seed.User.verified.id))
    
    expect(res.status).toBe(200)
    let org = await models.Organisation.findById(seed.Organisation.a.id)
    expect(org).toHaveProperty('deletedOn', expect.any(Date))
  })
  
  it('should fail if not an active coordinator', async () => {
    await pushMember(seed.Organisation.a, {
      user: seed.User.verified.id,
      role: MemberRole.Coordinator,
      confirmedOn: new Date(),
      deletedOn: new Date()
    })
    
    let res = await agent.del('/' + seed.Organisation.a.id)
      .set(tst.jwtHeader(seed.User.verified.id))
    
    expect(res.status).toBe(400)
    expect(res.body.meta.messages).toContain('api.general.badAuth')
  })
})
