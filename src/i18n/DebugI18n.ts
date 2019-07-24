import { LocaliseArgs } from '@/src/types'
import { I18n } from './I18n'

export class DebugI18n extends I18n {
  constructor() {
    super('__tests__')
    this.isSetup = true
  }

  translate(locale: string, key: string, args?: LocaliseArgs): string {
    let formattedArgs = ''
    if (args) {
      formattedArgs = Object.keys(args)
        .map(key => `${key}=${(args as any)[key]}`)
        .join(',')
    }
    return `${locale}:${key}:${formattedArgs}`
  }

  pluralise(locale: string, key: string, count: number): string {
    return `${locale}:${key}:${count}`
  }
}
