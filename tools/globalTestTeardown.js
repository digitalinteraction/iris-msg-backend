
module.exports = async function () {
  try {
    let mongod = global.__MONGOD__
    delete global.__MONGOD__
    await mongod.stop()
  } catch (err) {
    console.error(err)
  }
}
