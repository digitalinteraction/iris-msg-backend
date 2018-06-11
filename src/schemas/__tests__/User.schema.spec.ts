import { applySeed, Seed, openDb, closeDb, inTheFuture } from '../../../tools/testHarness'
import { IModelSet } from '../../models'
import { AuthCodeType } from '../../types'

let db: any
let models: IModelSet
let seed: Seed

beforeEach(async () => {
  ({ db, models } = await openDb())
  seed = await applySeed('test/auth', models)
})

afterEach(async () => {
  await closeDb(db)
})

describe('User', () => {
  describe('findWithJwt', () => {
    it('should find the user', async () => {
      let jwt = { usr: seed.User.verified.id }
      let user = await models.User.findWithJwt(jwt)
      expect(user).toBeDefined()
    })
  })
})
