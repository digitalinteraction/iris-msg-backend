const MongodbMemoryServer = require('mongodb-memory-server')

const MONGO_DB_NAME = 'iris_test'

module.exports = async function () {
  global.__MONGOD__ = new MongodbMemoryServer.default({
    instance: { dbName: MONGO_DB_NAME }
  })
  global.__MONGO_DB_NAME__ = MONGO_DB_NAME
}
