import { RouteContext } from '@/src/types'
import { twiml } from 'twilio'
import { Response } from 'express'
import { IMember } from '@/src/models'

const stopRegex = /stop\s*(\d+)/gi

/** Send twiml to an express response */
function sendSMS(res: Response, message: string): void {
  res.header('content-type', 'text/xml')
  res.header('Cache-Control', 'no-store, must-revalidate, max-age=0')
  res.header('Pragma', 'no-cache')
  res.header('Content-Type', 'application/xml')
  res.send(message)
}

export default async ({ req, res, models }: RouteContext) => {
  const { Body = '', From } = req.body

  const match = stopRegex.exec(Body)
  if (!match) return sendSMS(res, 'Unknown command')

  const shortcode = parseInt(match[1], 10)
  if (Number.isNaN(shortcode)) return sendSMS(res, 'Unknown command')

  // Find the organisation to unsubscribe from
  const org = await models.Organisation.findOne({ shortcode })
  if (!org) return sendSMS(res, "Couldn't find that organisation")

  // Find the user
  let user = await models.User.findOne({ phoneNumber: From })
  if (!user) return sendSMS(res, "You're already unsubscribed")

  // Find the member
  const member = org.members.find(m => m.user.equals(user!.id))
  if (!member) return sendSMS(res, "You're already unsubscribed")

  // Remove the member
  org.members.pull(member)

  // Let them know they're gone
  sendSMS(res, `You have been unsubscribed from ${org.name}`)
}
