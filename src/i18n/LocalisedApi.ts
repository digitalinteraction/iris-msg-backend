import { Api, Messages, IApiOptions, MetaBlock } from 'api-formatter'
import { LocalI18n } from './LocalI18n'

export class LocalisedApi extends Api {
  protected i18n?: LocalI18n
  
  setLocaliser (i18n: LocalI18n) {
    this.i18n = i18n
  }
  
  makeEnvelope (success: boolean, codes: Messages, status: number, data: any): any {
    if (!this.i18n) return super.makeEnvelope(success, codes, status, data)
    
    let messages = typeof codes === 'string'
      ? this.i18n.translate(codes)
      : codes.map(c => this.i18n!.translate(c))
    
    codes = typeof codes === 'string' ? [codes] : codes
    
    let meta = new MetaBlock(success, messages, status, this) as any
    return {
      meta: { ...meta, codes }, data
    }
  }
}
