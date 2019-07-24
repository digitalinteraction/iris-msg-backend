import expressJwt from 'express-jwt'

export default function(options: any = {}) {
  return expressJwt({ ...options, secret: process.env.JWT_SECRET })
}
