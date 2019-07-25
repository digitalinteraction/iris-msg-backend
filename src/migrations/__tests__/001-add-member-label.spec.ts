import * as tst from '../../../tools/testHarness'
import { exec } from '../001-add-member-label'
import { IModelSet } from '../../models'
import { MemberRole } from '@/src/types'

let db: any
let models: IModelSet

beforeEach(async () => {
  ;({ db, models } = await tst.openDb())
})

afterEach(async () => {
  await tst.closeDb(db)
})

describe('001-add-member-label', () => {
  it('should add labels to members which dont have them', async () => {
    let userA = await models.User.create({ locale: 'GB', phoneNumber: '1234' })
    let userB = await models.User.create({ locale: 'GB', phoneNumber: '5678' })

    let { _id } = await models.Organisation.create({
      name: 'test-org',
      info: 'some long info',
      locale: 'GB',
      members: [
        {
          role: MemberRole.Coordinator,
          confirmedOn: new Date(),
          user: userA.id
        },
        {
          role: MemberRole.Donor,
          confirmedOn: new Date(),
          user: userA.id,
          label: 'userA-donor'
        },
        {
          role: MemberRole.Subscriber,
          confirmedOn: new Date(),
          user: userB.id
        }
      ]
    })

    await exec({ models })

    let org = await models.Organisation.findOne({ _id })

    expect(org!.members[0].label).toBe('')
    expect(org!.members[1].label).toBe('userA-donor')
    expect(org!.members[2].label).toBe('')
  })
})
