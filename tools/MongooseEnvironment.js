const NodeEnvironment = require('jest-environment-node')
const mongoose = require('mongoose')

module.exports = class MongooseEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config)
  }

  async setup() {
    this.global.__MONGO_URI__ = await global.__MONGOD__.getConnectionString()
    this.global.__MONGO_DB_NAME__ = global.__MONGO_DB_NAME__
    
    process.env.MONGO_URI = this.global.__MONGO_URI__
    process.env.JWT_SECRET = 'some_really_bad_secret'
    
    this.mongoose = await mongoose.connect(this.global.__MONGO_URI__)
    
    await super.setup()
  }

  async teardown() {
    await this.mongoose.connection.close()
    await super.teardown()
  }

  runScript(script) {
    return super.runScript(script)
  }
}
