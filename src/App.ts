import * as express from 'express'
import * as mongoose from 'mongoose'
import { applyMiddleware, applyRoutes, applyErrorHandler } from './router'
import { makeModels } from './models'
import { initializeFirebase, firebaseEnabled } from './services'

const RequiredVariables = [
  'MONGO_URI', 'JWT_SECRET', 'API_URL', 'WEB_URL', 'TWILIO_TOKEN', 'TWILIO_SID', 'TWILIO_NUMBER'
]

export default class App {
  static create (): App {
    return new this()
  }
  
  async run () {
    try {
      this.checkEnvironment()
      initializeFirebase()
      let app = this.createExpressApp()
      await this.connectToMongo()
      await new Promise(resolve => app.listen(3000, resolve))
      console.log('Server started on :3000')
    } catch (error) {
      console.log('Failed to start')
      console.log(error)
    }
  }
  
  checkEnvironment () {
    // Ensure all required variables are set
    RequiredVariables.forEach(varName => {
      if (process.env[varName]) return
      console.log(`Missing variable '${varName}'`)
      process.exit(1)
    })
    
    // Work out if we can use firebase
    if (!firebaseEnabled()) {
      console.log(`Firebase isn't configured`)
      console.log(`- Ensure 'FIREBASE_DB' is set`)
      console.log(`- Ensure 'google-account.json' is mounted`)
      process.exit(1)
    }
  }
  
  createExpressApp (): express.Application {
    let app = express()
    applyMiddleware(app)
    applyRoutes(app, makeModels(mongoose.connection))
    applyErrorHandler(app)
    return app
  }
  
  async connectToMongo () {
    return mongoose.connect(process.env.MONGO_URI)
  }
}

export const defaultApp = new App()
