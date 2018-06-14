const NodeEnvironment = require('jest-environment-node')
const MongodbMemoryServer = require('mongodb-memory-server')

module.exports = class MongooseEnvironment extends NodeEnvironment {
  
  async setup() {
    await super.setup()
    
    this.global.__MONGO_URI__ = global.__MONGO_URI__
    
    this.global.process.env.MONGO_URI = this.global.__MONGO_URI__
    this.global.process.env.JWT_SECRET = 'some_really_bad_secret'
    this.global.process.env.API_URL = 'http://localhost:3000'
    this.global.process.env.WEB_URL = 'http://localhost:8080'
  }

  async teardown() {
    delete this.global.__MONGO_URI__
    
    await super.teardown()
  }
}
