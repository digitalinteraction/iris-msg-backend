
module.exports = async function () {
  process.env.JWT_SECRET = 'not_secret_for_testing'
  // process.env.MONGO_URI = ''
}
