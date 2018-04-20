import { applySeed, Seed, mockRoute, Agent, openDb, closeDb } from '../../../../tools/testHarness'
import verifyCheck from '../verifyCheck.route'
import { IModelSet } from '../../../models'
import { AuthCodeType } from '../../../types'
import { verify } from 'jsonwebtoken'

let db: any
let models: IModelSet
let seed: Seed
let agent: Agent

beforeEach(async () => {
  ({ db, models } = await openDb())
  seed = await applySeed('test/auth', models)
  agent = mockRoute(verifyCheck, models)
  
  await models.AuthCode.create({
    code: 123456,
    expiresOn: new Date(Date.UTC(5000, 0)),
    usedOn: null,
    user: seed.User.unverified.id,
    type: AuthCodeType.Verify
  })
})

afterEach(async () => {
  await closeDb(db)
})

describe('auth.verify.check', () => {
  it('should return a 200', async () => {
    let res = await agent.post('/').send({ code: 123456 })
    expect(res.status).toBe(200)
  })
  it('should verify the user', async () => {
    let res = await agent.post('/').send({ code: 123456 })
    let user: any = await models.User.findOne()
    expect(user.verifiedOn).toBeTruthy()
  })
  it('should return the user', async () => {
    let res = await agent.post('/').send({ code: 123456 })
    let user = res.body.data.user
    expect(user).toBeTruthy()
    expect(user.phoneNumber).toBe('+447880123002')
  })
  it('should return an access token', async () => {
    let res = await agent.post('/').send({ code: 123456 })
    let token = res.body.data.token
    expect(token).toBeTruthy()
  })
  it('should embed details in the jwt', async () => {
    let res = await agent.post('/').send({ code: 123456 })
    let payload = verify(res.body.data.token, process.env.JWT_SECRET) as any
    expect(payload.usr).toBe(seed.User.unverified.id)
    expect(payload.num).toBe(seed.User.unverified.phoneNumber)
  })
  it('should fail if the code has expired', async () => {
    await models.AuthCode.create({
      code: 654321,
      expiresOn: new Date(Date.UTC(1000, 0)),
      usedOn: null,
      user: seed.User.unverified.id,
      type: AuthCodeType.Verify
    })
    let res = await agent.post('/').send({ code: 654321 })
    expect(res.status).toBe(400)
  })
})
