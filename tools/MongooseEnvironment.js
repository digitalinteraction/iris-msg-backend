const NodeEnvironment = require('jest-environment-node')
// const mongoose = require('mongoose')

module.exports = class MongooseEnvironment extends NodeEnvironment {
  
  async setup() {
    await super.setup()
    
    this.global.__MONGO_URI__ = await global.__MONGOD__.getConnectionString()
    this.global.__MONGO_DB_NAME__ = global.__MONGO_DB_NAME__
    
    // this.global.__MONGOOSE__ = await mongoose.connect(this.global.__MONGO_URI__)
    
    // this.global.__MONGO_URI__ = global.__MONGO_URI__
    // this.global.__MONGO_DB_NAME__ = global.__MONGO_DB_NAME__
    // this.global.__MONGOOSE__ = global.__MONGOOSE__
    
    this.global.process.env.MONGO_URI = this.global.__MONGO_URI__
    this.global.process.env.JWT_SECRET = 'some_really_bad_secret'
  }

  async teardown() {
    // await this.global.__MONGOOSE__.connection.close()
    // let collections = this.global.__MONGOOSE__.connection.collections
    // Object.entries(collections).map(([name, Model]) => {
    //   console.log(name)
    // })
    await super.teardown()
  }
}
