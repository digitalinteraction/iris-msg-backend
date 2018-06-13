
module.exports = async function () {
  let mongod = global.__MONGOD__
  delete global.__MONGOD__
  await mongod.stop()
}
