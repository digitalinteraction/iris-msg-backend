
module.exports = async function () {
  // await global.__MONGOOSE__.connection.close()
  try {
    await global.__MONGOD__.stop()
  } catch (e) { console.log(e) }
}
