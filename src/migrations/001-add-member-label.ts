import { MigrateContext } from '../types'

export async function exec({ models }: MigrateContext) {
  let orgs = await models.Organisation.find({
    members: {
      $elemMatch: { label: null }
    }
  })

  for (let org of orgs) {
    for (let member of org.members) {
      if (typeof member.label === 'string') continue
      member.label = ''
    }
  }

  await Promise.all(orgs.map(o => o.save()))
}
