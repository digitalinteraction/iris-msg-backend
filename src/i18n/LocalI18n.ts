import { ILocaliser, LocaliseArgs } from '@/src/types'

export class LocalI18n {
  constructor(public i18n: ILocaliser, public locale: string) {}

  translate(key: string, args?: LocaliseArgs): string {
    return this.i18n.translate(this.locale, key, args)
  }

  // pluralise (key: string, count: number): string {
  //   return this.i18n.pluralise(this.locale, key, count)
  // }
}
