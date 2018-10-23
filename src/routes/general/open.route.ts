import { RouteContext } from '@/src/types'
import * as pug from 'pug'
import { join } from 'path'

function makeError (name: string) {
  return `api.open.${name}`
}

const inviteTest = /invite\/.*/
const donateTest = /donate/

const templatePath = join(__dirname, '../../templates/downloadApp.pug')

const template = process.env.NODE_ENV === 'development'
  ? (...args: any[]) => pug.compileFile(templatePath)(...args)
  : pug.compileFile(templatePath)

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
