import { ExpressMiddleware } from '../types'
import winston = require('winston')

export default function (log: winston.Logger): ExpressMiddleware {
  return (req, res, next) => {
    
    // Log the request
    log.debug(`${req.method.toUpperCase()}: ${req.path}`, {
      query: req.query
    })
    
    next()
  }
}
