import Twilio from 'twilio'

export function makeTwilioClient () {
  return Twilio(process.env.TWILIO_SID!, process.env.TWILIO_TOKEN!)
}

export function sendTwilioMessage (to: string, body: string) {
  return makeTwilioClient().messages.create({
    from: process.env.TWILIO_NUMBER, to, body
  })
}
