import * as tst from '@/tools/testHarness'
import loginCheck from '../loginCheck.route'
import { IModelSet, IAuthCode } from '@/src/models'
import { AuthCodeType } from '@/src/types'
import { verify } from 'jsonwebtoken'

let db: any
let models: IModelSet
let seed: tst.Seed
let agent: tst.Agent
let code: IAuthCode

beforeEach(async () => {
  ({ db, models } = await tst.openDb())
  seed = await tst.applySeed('test/auth', models)
  agent = tst.mockRoute(loginCheck, models)
  
  code = await models.AuthCode.create({
    code: 123456,
    expiresOn: new Date(Date.UTC(5000, 0)),
    usedOn: null,
    user: seed.User.verified.id,
    type: AuthCodeType.Login
  })
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('auth.login.check', () => {
  it('should return an http/200', async () => {
    let res = await agent.post('/').send({ code: 123456 })
    expect(res.status).toBe(200)
  })
  
  it('should return the user', async () => {
    let res = await agent.post('/').send({ code: 123456 })
    let user = res.body.data.user
    expect(user._id).toEqual(seed.User.verified.id)
  })
  
  it('should return a jwt', async () => {
    let res = await agent.post('/').send({ code: 123456 })
    let payload = verify(res.body.data.token, process.env.JWT_SECRET!) as any
    expect(payload.usr).toBe(seed.User.verified.id)
  })
  
  it('should fail if the code has expired', async () => {
    await models.AuthCode.create({
      code: 654321,
      expiresOn: tst.inThePast,
      usedOn: null,
      user: seed.User.verified.id,
      type: AuthCodeType.Login
    })
    let res = await agent.post('/').send({ code: 654321 })
    expect(res.status).toBe(400)
  })
  
  it('should verify a user if not already', async () => {
    await models.AuthCode.create({
      code: 654321,
      expiresOn: tst.inTheFuture,
      user: seed.User.unverified.id,
      type: AuthCodeType.Login
    })
    await agent.post('/').send({ code: 654321 })
    let user = await models.User.findById(seed.User.unverified.id)
    expect(user!.verifiedOn).toBeInstanceOf(Date)
  })
  
  it('should mark the code as used', async () => {
    await agent.post('/').send({ code: 123456 })
    let updatedCode = await models.AuthCode.findById(code.id)
    expect(updatedCode!.usedOn).toBeInstanceOf(Date)
  })
  
  it('should fail for used codes', async () => {
    await code.update({ usedOn: new Date() })
    let res = await agent.post('/').send({ code: 123456 })
    expect(res.status).toBe(400)
  })
})
