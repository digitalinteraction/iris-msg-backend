const MongodbMemoryServer = require('mongodb-memory-server').default

module.exports = async function () {
  global.__MONGOD__ = new MongodbMemoryServer()
  global.__MONGO_URI__ = await global.__MONGOD__.getConnectionString()
}
