import * as tst from '../../../tools/testHarness'
import { exec } from '../002-add-organisation-shortcode'
import { IModelSet } from '@/src/models'

let db: any
let models: IModelSet

beforeEach(async () => {
  ;({ db, models } = await tst.openDb())
})

afterEach(async () => {
  await tst.closeDb(db)
})

function makeOrg(name: string) {
  return {
    name: name,
    info: 'A test org',
    locale: 'GB',
    members: []
  }
}

describe('002-add-organisation-shortcode', () => {
  it("should add shortcodes to organisations that don't have them", async () => {
    const [a1, b1, c1] = await models.Organisation.create([
      makeOrg('orgA'),
      makeOrg('orgB'),
      makeOrg('orgC')
    ])

    await exec({ models })

    const a2 = await models.Organisation.findById(a1._id)
    const b2 = await models.Organisation.findById(b1._id)
    const c2 = await models.Organisation.findById(c1._id)

    expect(a2!.shortcode).toEqual(expect.any(Number))
    expect(b2!.shortcode).toEqual(expect.any(Number))
    expect(c2!.shortcode).toEqual(expect.any(Number))
  })
})
