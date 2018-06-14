import { RouteContext } from '../../../types'

function makeError (name: string) {
  return `api.orgs.members.unsubscribe.${name}`
}

/* url params:
 * - mem_id ~ The id of the member to unsubscribe
 */
export default async ({ req, res, next, models }: RouteContext) => {
  try {
    // Find an organisation with that confirmed member
    let org = await models.Organisation.findOne({
      deletedOn: null,
      members: {
        $elemMatch: {
          _id: req.params.mem_id,
          deletedOn: null,
          confirmedOn: { $ne: null }
        }
      }
    })
    
    if (!org) throw makeError('notFound')
    
    let mem = org.members.id(req.params.mem_id)
    mem.deletedOn = new Date()
    
    await org.save()
    
    res.send('You have been unsubscribed')
    
  } catch (error) {
    res.status(400).send(error)
  }
}
