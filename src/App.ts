import * as express from 'express'
import * as mongoose from 'mongoose'
import * as models from './models'
import { applyMiddleware, applyRoutes, applyErrorHandler } from './router'

export default class App {
  async run () {
    try {
      let app = this.createExpressApp()
      await this.connectToMongo()
      await new Promise(resolve => app.listen(3000, resolve))
      console.log('Server started on :3000')
    } catch (error) {
      console.log('Failed to start')
      console.log(error)
    }
  }
  
  createExpressApp (): express.Application {
    let app = express()
    applyMiddleware(app)
    applyRoutes(app)
    applyErrorHandler(app)
    return app
  }
  
  async connectToMongo () {
    return mongoose.connect(process.env.MONGO_URI)
  }
}
