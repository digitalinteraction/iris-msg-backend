const MongodbMemoryServer = require('mongodb-memory-server')
const mongoose = require('mongoose')

module.exports = async function () {
  global.__MONGOD__ = new MongodbMemoryServer.default()
}
