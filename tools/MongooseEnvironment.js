const NodeEnvironment = require('jest-environment-node')
const uuid = require('uuid/v4')

module.exports = class MongooseEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup()

    // unique-ify the mongo_url
    let mongoURL = new URL(process.env.MONGO_URI)
    mongoURL.pathname = '/' + uuid()
    this.global.process.env.MONGO_URI = mongoURL.toString()

    this.global.process.env.JWT_SECRET = 'some_really_bad_secret'
    this.global.process.env.API_URL = 'http://localhost:3000'
    this.global.process.env.WEB_URL = 'http://localhost:8080'
    this.global.process.env.FIREBASE_DB = 'https://some-proj.firebaseio.com'
    this.global.process.env.FIREBASE_SANDBOX = 'true'
    this.global.process.env.TWILIO_FALLBACK = 'true'
    this.global.process.env.TWILIO_NUMBER = '+4401234567890'
    this.global.process.env.LATEST_APP_VERSION = '1.2'
    this.global.process.env.LATEST_APP_URL = 'http://app.irismsg.io'
  }

  async teardown() {
    await super.teardown()
  }
}
