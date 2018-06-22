import { I18n, LocaliseArgs } from './I18n'

export class DebugI18n extends I18n {
  
  constructor () {
    super('__tests__')
    this.isSetup = true
  }
  
  translate (locale: string, key: string, args: LocaliseArgs): string {
    return `translate:${locale}:${key}`
  }
  
  pluralise (locale: string, key: string, count: number): string {
    return `pluralise:${locale}:${key}:${count}`
  }
}
