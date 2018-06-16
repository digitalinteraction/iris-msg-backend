import * as express from 'express'
import * as mongoose from 'mongoose'
import { applyMiddleware, applyRoutes, applyErrorHandler } from './router'
import { makeModels } from './models'

const RequiredVariables = [
  'MONGO_URI', 'JWT_SECRET', 'API_URL', 'WEB_URL'
]

const TwilioVariables = [
  'TWILIO_TOKEN', 'TWILIO_SID', 'TWILIO_NUMBER'
]

export default class App {
  static create (): App {
    return new this()
  }
  
  async run () {
    try {
      this.checkVariables()
      let app = this.createExpressApp()
      await this.connectToMongo()
      await new Promise(resolve => app.listen(3000, resolve))
      console.log('Server started on :3000')
    } catch (error) {
      console.log('Failed to start')
      console.log(error)
    }
  }
  
  checkVariables () {
    // Ensure all required variables are set
    RequiredVariables.forEach(varName => {
      if (process.env[varName]) return
      console.log(`Missing variable '${varName}'`)
      process.exit(1)
    })
    
    // Work out if all twilio variables are set
    let allowTwilio = TwilioVariables.reduce(
      (flag, name) => flag && process.env[name], true
    )
    if (!allowTwilio) console.log('Twilio disabled')
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
