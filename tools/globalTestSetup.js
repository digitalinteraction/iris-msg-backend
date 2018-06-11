const MongodbMemoryServer = require('mongodb-memory-server').default
const mongoose = require('mongoose')

module.exports = function () {
  global.__MONGOD__ = new MongodbMemoryServer()
}
