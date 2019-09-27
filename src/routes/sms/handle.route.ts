import { RouteContext, MemberRole } from '@/src/types'
import { Request, Response } from 'express'
import { LocalI18n } from '@/src/i18n'
import MessagingResponse = require('twilio/lib/twiml/MessagingResponse')

const stopRegex = /stop\s*(\d+)/gi

/** Send twiml to an express response */
function sendSMS(res: Response, body: string): void {
  res.header('content-type', 'text/xml')
  res.header('Cache-Control', 'no-store, must-revalidate, max-age=0')
  res.header('Pragma', 'no-cache')
  res.header('Content-Type', 'application/xml')

  let message = new MessagingResponse()
  message.message(body)
  res.send(message.toString())
}

export default async ({ req, res, models, i18n }: RouteContext) => {
  const { Body = '', From } = req.body

  const t = (key: string, args: string[] = []) => i18n.translate(key, args)

  const match = stopRegex.exec(Body)
  if (!match) return sendSMS(res, t('api.sms.handle.unknown'))

  const shortcode = parseInt(match[1], 10)

  if (Number.isNaN(shortcode)) return sendSMS(res, t('api.sms.handle.unknown'))

  // Find the organisation to unsubscribe from
  const org = await models.Organisation.findOne({ shortcode })
  if (!org) return sendSMS(res, t('api.sms.handle.notFound'))

  // Find the user
  let user = await models.User.findOne({ phoneNumber: From })
  if (!user) return sendSMS(res, t('api.sms.handle.alreadyDone'))

  // Find the member
  const member = org.members.find(
    member =>
      member.user.equals(user!.id) && member.role === MemberRole.Subscriber
  )
  if (!member) return sendSMS(res, t('api.sms.handle.alreadyDone'))

  // Remove the member
  member.deletedOn = new Date()
  await org.save()

  // Let them know they're gone
  sendSMS(res, t('api.sms.handle.confirmed', [org.name]))
}
