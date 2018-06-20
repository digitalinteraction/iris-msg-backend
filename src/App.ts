import * as express from 'express'
import * as mongoose from 'mongoose'
import { applyMiddleware, applyRoutes, applyErrorHandler } from './router'
import { makeModels, IModelSet } from './models'
import { initializeFirebase, firebaseEnabled } from './services'
import { Task, ReallocationTask } from './tasks'

const RequiredVariables = [
  'MONGO_URI', 'JWT_SECRET', 'API_URL', 'WEB_URL', 'TWILIO_TOKEN', 'TWILIO_SID', 'TWILIO_NUMBER'
]

export default class App {
  reallocTask = new ReallocationTask()
  
  static create (): App {
    return new this()
  }
  
  async run () {
    try {
      this.setupLogger()
      
      this.checkEnvironment()
      
      initializeFirebase()
      
      let models = makeModels(mongoose.connection)
      
      let app = this.createExpressApp(models)
      
      await this.connectToMongo()
      
      this.startTasks(models)
      
      await new Promise(resolve => app.listen(3000, resolve))
      console.log('Server started on :3000')
    } catch (error) {
      console.log('Failed to start')
      console.log(error)
    }
  }
  
  setupLogger () {
    // ...
    
    // none | debug | info | warn | error
    
    // none > disable logs
    
    // debug > debug.log
    // debug info
    
    // info  > info.log
    // access logs
    
    // warn  > warn.log
    // error > error.log
  }
  
  startTasks (models: IModelSet) {
    this.reallocTask.schedule({ models })
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
  
  createExpressApp (models: IModelSet): express.Application {
    let app = express()
    applyMiddleware(app)
    applyRoutes(app, models)
    applyErrorHandler(app)
    return app
  }
  
  async connectToMongo () {
    return mongoose.connect(process.env.MONGO_URI)
  }
}

export const defaultApp = new App()
