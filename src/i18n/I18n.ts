import { join } from 'path'
import { readdirSync, statSync, readFile } from 'fs'
import yaml = require('js-yaml')
import dot = require('dot-prop')

import { LocalI18n } from './LocalI18n'
import { LocaliseArgs } from '@/src/types'

export type Localisation = {
  [locale: string]: object | any
}

export class I18n {
  public isSetup = false
  public locales: Localisation = {}
  
  constructor (public directory: string) {
  }
  
  async setup () {
    let files = readdirSync(this.directory)
    
    await Promise.all(files.map(async filename => {
      try {
        let filepath = join(this.directory, filename)
        
        // Check the item is a file
        let stat = statSync(filepath)
        if (!stat.isFile()) return
        
        // Fetch the file
        let data = await readFileAsync(filepath)
        
        // Parse the file depending on type
        let { file, ext } = parseFilename(filename)
        switch (ext) {
          // case 'json': return this.locales[file] = JSON.parse(data)
          case 'yml': return this.locales[file] = yaml.safeLoad(data)
          default: throw new Error(`Invalid local file ${filename}`)
        }
      } catch (error) {
        console.log(error)
      }
    }))
    this.isSetup = true
  }
  
  makeInstance (locale: string): LocalI18n {
    return new LocalI18n(this, locale)
  }
  
  translate (locale: string, key: string, args?: LocaliseArgs): string {
    return this.processTranslation(
      dot.get(this.locales, `${locale.toLowerCase()}.${key}`),
      key,
      args
    )
  }
  
  // pluralise (locale: string, key: string, count: number): string {
  //   return this.processPluralise(
  //     dot.get(this.locales, `${locale}.${key}`),
  //     key,
  //     count
  //   )
  // }
  
  processTranslation (text: any, key: string, args?: LocaliseArgs): string {
    if (!text) return key
    if (Array.isArray(args)) {
      args.forEach((variable, index) => {
        text = stringReplace(text, `${index}`, variable)
      })
    }
    if (typeof args === 'object') {
      Object.keys(args).forEach(key => {
        text = stringReplace(text, key, (args as any)[key])
      })
    }
    return text
  }
  
  // processPluralise (text: any, key: string, count: number): string {
  //   throw new Error('Not implemented')
  // }
}

export function parseFilename (
  filename: string
): { file: string, ext: string } {
  
  let comps = filename.split('.')
  if (comps.length <= 1) return { file: filename, ext: '' }
  
  let ext = comps.pop() as string
  let file = comps.join('.')
  
  return { file, ext }
}

export function readFileAsync (path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    readFile(path, (err, data) => {
      if (err) reject(err)
      else resolve(data.toString('utf8'))
    })
  })
}

export function stringReplace (input: string, variable: string, value: any): string {
  return input.replace(
    new RegExp(`\\{${variable}\\}`, 'g'),
    value
  )
}
