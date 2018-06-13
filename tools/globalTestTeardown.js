
module.exports = function () {
  let mongod = global.__MONGOD__
  delete global.__MONGOD__
  return mongod.stop()
}
