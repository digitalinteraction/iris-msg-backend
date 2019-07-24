//
// This file is executed after all jest tests have finished
// We use it to close the in-memory mongo connection
//
// ref: https://jestjs.io/docs/en/configuration#globalteardown-string
//

module.exports = async function() {
  //
  // If there is a global mongo deamon stop it
  // There might not be one if using an external database
  //
  if (global.__MONGO_D__) {
    await global.__MONGO_D__.stop()
  }
}
