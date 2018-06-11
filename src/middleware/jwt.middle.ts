import expressJwt = require('express-jwt')

export default function (options: any = {}) {
  return expressJwt({ ...options, secret: process.env.JWT_SECRET })
}
