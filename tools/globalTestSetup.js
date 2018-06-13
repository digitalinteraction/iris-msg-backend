const MongodbMemoryServer = require('mongodb-memory-server').default
const mongoose = require('mongoose')

module.exports = function () {
  delete global.__MONGOD__
  global.__MONGOD__ = new MongodbMemoryServer()
}
