const MongodbMemoryServer = require('mongodb-memory-server')
const mongoose = require('mongoose')

const MONGO_DB_NAME = 'iris_test'

module.exports = async function () {
  global.__MONGOD__ = new MongodbMemoryServer.default({
    instance: { dbName: MONGO_DB_NAME }
  })
  global.__MONGO_DB_NAME__ = MONGO_DB_NAME
  // global.__MONGO_URI__ = await global.__MONGOD__.getConnectionString()
  // global.__MONGOOSE__ = await mongoose.connect(global.__MONGO_URI__)
}
