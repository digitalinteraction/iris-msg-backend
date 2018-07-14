import { RouteContext } from '@/src/types'
import { readFile } from 'fs'
import { join } from 'path'

export default async ({ res, next }: RouteContext) => {
  
  // Attempt to read the file
  readFile(join(__dirname, '../../../assetlinks.json'), (err, data) => {
    if (err) {
      next()
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.send(data)
    }
  })
}
