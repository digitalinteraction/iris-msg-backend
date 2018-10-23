import { RouteContext } from '@/src/types'
import { compilePug } from '@/src/utils'
import { join } from 'path'

function makeError (name: string) {
  return `api.open.${name}`
}

const inviteTest = /invite\/.*/
const donateTest = /donate/

const template = compilePug(join(__dirname, '../../templates/downloadApp.pug'))

/* params
 * - 0
 */
export default async (ctx: RouteContext) => {
  
  let path = ctx.req.params[0]
  
  if (inviteTest.exec(path)) return handleInvite(ctx)
  else if (donateTest.exec(path)) return handleDonate(ctx)
  else return ctx.next()
}

export function handleInvite ({ req, res }: RouteContext) {
  res.send(template({
    title: 'Your invitation',
    appLink: process.env.PLAY_STORE_URL!
  }))
}

export function handleDonate ({ req, res }: RouteContext) {
  res.send(template({
    title: 'Donation Request',
    appLink: process.env.PLAY_STORE_URL!
  }))
}
