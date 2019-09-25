import { MigrateContext } from '../types'

export async function exec({ models }: MigrateContext) {
  //
  // Find all organisations with no shortcode
  //
  let orgs = await models.Organisation.find({ shortcode: null })

  //
  // Get the next shortcode to allocate
  //
  let orgCount = await models.Organisation.nextShortcode()

  //
  // Set a new shortcode on each organisation
  //
  for (let org of orgs) {
    org.shortcode = orgCount++
  }

  //
  // Save the organisations
  //
  await Promise.all(orgs.map(o => o.save()))
}
