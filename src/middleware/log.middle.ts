import { ExpressMiddleware } from '../types'
import winston from 'winston'

type Excluder = RegExp | string

export default function (
  log: winston.Logger, excludes: Excluder[] = []
): ExpressMiddleware {
  return (req, res, next) => {
    
    let skipLog = excludes.some(
      pattern => pattern instanceof RegExp
        ? pattern.test(req.path)
        : req.path.startsWith(pattern)
    )
    
    // Log the request if we are allowed
    if (!skipLog) {
      let now = new Date().toISOString()
      log.debug(`${req.method.toUpperCase()}: ${req.path}`, {
        date: now,
        query: req.query
      })
    }
    
    next()
  }
}
