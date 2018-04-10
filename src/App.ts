import * as routes from './routes'
import * as express from 'express'
import { applyMiddleware, applyRoutes, applyErrorHandler } from './router'

export default class App {
  async run () {
    let app = express()
    applyMiddleware(app)
    applyRoutes(app)
    applyErrorHandler(app)
    await new Promise(resolve => app.listen(3000, resolve))
    console.log('Server started on :3000')
  }
}
