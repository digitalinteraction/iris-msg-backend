//
// This file is executed after all jest tests have finished
// We use it to close the in-memory mongo connection
//
// ref: https://jestjs.io/docs/en/configuration#globalsetup-string
//

// Optionally import the in-memory server
// -> Don't import it if an external database is being used
// -> If we import it it'll attempt to download the database binary
const MongodbMemoryServer = process.env.MONGO_URI
  ? null
  : require('mongodb-memory-server-core').default

module.exports = async function() {
  //
  // If using an external database, stop here and do nothing
  //
  if (!MongodbMemoryServer) return

  //
  // Create an in-memory mongo server and store it on the global object
  //
  global.__MONGO_D__ = new MongodbMemoryServer()

  //
  // Generate a mongo url and pass it to the test environment
  //
  process.env.MONGO_URI = await global.__MONGO_D__.getConnectionString()
}
