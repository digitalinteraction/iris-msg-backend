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

describe('AuthCode', () => {
  describe('.forUser', () => {
    it('should create an AuthCode', async () => {
      let code = await models.AuthCode
        .forUser(seed.User.verified.id, AuthCodeType.Verify)
      
      expect(code).toBeDefined()
      expect(code.user).toEqual(seed.User.verified._id)
      expect(code.type).toBe(AuthCodeType.Verify)
    })
  })
  
  describe('.fromCode', () => {
    it('should find an AuthCode', async () => {
      await models.AuthCode.create({
        code: 123456,
        expiresOn: inTheFuture,
        type: AuthCodeType.Verify,
        user: seed.User.verified.id
      })
      
      let code = await models.AuthCode
        .fromCode(123456, AuthCodeType.Verify)
      
      expect(code).toBeDefined()
    })
  })
  
  describe('#formatted', () => {
    it('should format as abc-xyz', async () => {
      let code = await models.AuthCode.create({
        code: 123456,
        expiresOn: inTheFuture,
        type: AuthCodeType.Verify,
        user: seed.User.verified.id
      })
      expect(code.formatted).toBe('123-456')
    })
    it('should forward pad', async () => {
      let code = await models.AuthCode.create({
        code: 123,
        expiresOn: inTheFuture,
        type: AuthCodeType.Verify,
        user: seed.User.verified.id
      })
      expect(code.formatted).toBe('000-123')
    })
  })
})
