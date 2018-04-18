import * as Twilio from 'twilio'

export function makeTwilioClient () {
  return Twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
}
