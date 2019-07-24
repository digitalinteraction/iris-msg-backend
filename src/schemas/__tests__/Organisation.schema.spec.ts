import { applySeed, Seed, openDb, closeDb } from '../../../tools/testHarness'
import { IModelSet } from '../../models'
import { MemberRole } from '../../types'

let db: any
let models: IModelSet
let seed: Seed

function makeOrg(member: any, extraArgs: any = {}) {
  return models.Organisation.create({
    name: 'Org',
    info: 'Organisation',
    members: [member],
    ...extraArgs
  })
}

beforeEach(async () => {
  ;({ db, models } = await openDb())
  seed = await applySeed('test/orgs', models)
})

afterEach(async () => {
  await closeDb(db)
})

describe('Organisation', () => {
  describe('.findForUser', () => {
    it('should return organisations the user is a member of', async () => {
      await makeOrg({
        user: seed.User.verified.id,
        role: MemberRole.Coordinator,
        confirmedOn: new Date(),
        deletedOn: null
      })

      let orgs = await models.Organisation.findForUser(seed.User.verified.id)
      expect(orgs).toHaveLength(1)
    })
    it('should ignore deleted organisations', async () => {
      await makeOrg(
        {
          user: seed.User.verified.id,
          role: MemberRole.Coordinator,
          confirmedOn: new Date()
        },
        { deletedOn: new Date() }
      )

      let orgs = await models.Organisation.findForUser(seed.User.verified.id)
      expect(orgs).toHaveLength(0)
    })
  })
  describe('.findByIdForCoordinator', () => {
    it('should find an org when the user is a coordinator', async () => {
      let org = await makeOrg({
        user: seed.User.verified.id,
        role: MemberRole.Coordinator,
        confirmedOn: new Date(),
        deletedOn: null
      })

      let matched = await models.Organisation.findByIdForCoordinator(
        org.id,
        seed.User.verified.id
      )
      expect(matched).toBeDefined()
    })
    it('should ignore deleted organisations', async () => {
      let org = await makeOrg(
        {
          user: seed.User.verified.id,
          role: MemberRole.Coordinator,
          confirmedOn: new Date(),
          deletedOn: null
        },
        { deletedOn: new Date() }
      )

      let matched = await models.Organisation.findByIdForCoordinator(
        org.id,
        seed.User.verified.id
      )
      expect(matched).toBeNull()
    })
  })
})
