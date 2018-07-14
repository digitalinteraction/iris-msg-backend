import * as express from 'express'
import * as mongoose from 'mongoose'
import { existsSync } from 'fs'
import { join } from 'path'
import { applyMiddleware, applyRoutes, applyErrorHandler } from './router'
import { makeModels, IModelSet } from './models'
import { I18n, i18n } from './i18n'
import { initializeFirebase, firebaseEnabled } from './services'
import { ReallocationTask } from './tasks'

const RequiredVariables = [
  'MONGO_URI',
  'JWT_SECRET',
  'API_URL',
  'WEB_URL',
  'TWILIO_TOKEN',
  'TWILIO_SID',
  'TWILIO_NUMBER'
]

const RequiredFiles = [
  'assetlinks.json',
  'google-account.json'
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
      
      let i18n = await this.makeI18n()
      let models = makeModels(mongoose.connection)
      let app = this.createExpressApp(models, i18n)
      
      await new Promise(resolve => app.listen(3000, resolve))
      console.log('Server started on :3000')
      
      await this.connectToMongo()
      
      this.startTasks(models)
    } catch (error) {
      console.log('Failed to start')
      console.log(error)
    }
  }
  
  async makeI18n (): Promise<I18n> {
    await i18n.setup()
    return i18n
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
    
    // See if there are any missing variables
    let missingVars = RequiredVariables.filter(varName => {
      return process.env[varName] === undefined
    })
    
    // Fail if there are any missing variables
    if (missingVars.length > 0) {
      console.log(`Missing variables: ${missingVars.join(', ')}`)
      process.exit(1)
    }
    
    // See if there are any missing files
    // Uses `sync` because the app cannot start without them
    let missingFiles = RequiredFiles
      .map(filename => join(__dirname, '..', filename))
      .filter(path => !existsSync(path))
    
    if (missingFiles.length > 0) {
      console.log(`Missing files: ${missingFiles.join(', ')}`)
      process.exit(1)
    }
    
    // Work out if we can use firebase
    if (!firebaseEnabled()) {
      console.log(`Firebase isn't configured`)
      console.log(`- Ensure 'FIREBASE_DB' is set`)
      console.log(`- Ensure 'google-account.json' is mounted`)
      process.exit(1)
    }
  }
  
  createExpressApp (models: IModelSet, i18n: I18n): express.Application {
    let app = express()
    applyMiddleware(app)
    applyRoutes(app, models, i18n)
    applyErrorHandler(app)
    return app
  }
  
  async connectToMongo () {
    return mongoose.connect(process.env.MONGO_URI!)
  }
}

export const defaultApp = new App()
