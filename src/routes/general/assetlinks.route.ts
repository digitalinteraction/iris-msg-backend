import { RouteContext } from '@/src/types'
import { readFile } from 'fs'
import { join } from 'path'

const assetLinkPath = join(__dirname, '../../../assetlinks.json')

export default async ({ res, next }: RouteContext) => {
  
  // Attempt to read the file
  readFile(assetLinkPath, (err, data) => {
    if (err) {
      next(err)
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.send(data)
    }
  })
}
