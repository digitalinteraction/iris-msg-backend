import { applySeed, Seed, openDb, closeDb } from '../../../tools/testHarness'
import * as models from '../../models'
import { MemberRole } from '../../types'
import { Model } from 'mongoose'

let db: any
let seed: Seed

function makeOrg (member: any, extraArgs: any = {}) {
  return models.Organisation.create({
    name: 'Org',
    info: 'Organisation',
    members: [ member ],
    ...extraArgs
  })
}

beforeEach(async () => {
  db = await openDb()
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
        confirmedOn: new Date()
      })
      
      let orgs = await models.Organisation.findForUser(seed.User.verified.id)
      expect(orgs).toHaveLength(1)
    })
    it('should ignore deleted organisations', async () => {
      await makeOrg({
        user: seed.User.verified.id,
        role: MemberRole.Coordinator,
        confirmedOn: new Date()
      }, { deletedOn: new Date() })
      
      let orgs = await models.Organisation.findForUser(seed.User.verified.id)
      expect(orgs).toHaveLength(0)
    })
    it('should ignore unconfirmed members', async () => {
      await makeOrg({
        user: seed.User.verified.id,
        role: MemberRole.Coordinator,
        confirmedOn: null
      })
      
      let orgs = await models.Organisation.findForUser(seed.User.verified.id)
      expect(orgs).toHaveLength(0)
    })
    it('should ignore deleted members', async () => {
      await makeOrg({
        user: seed.User.verified.id,
        role: MemberRole.Coordinator,
        confirmedOn: new Date(),
        deletedOn: new Date()
      })
      
      let orgs = await models.Organisation.findForUser(seed.User.verified.id)
      expect(orgs).toHaveLength(0)
    })
  })
})
