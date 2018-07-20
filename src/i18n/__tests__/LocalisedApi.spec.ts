import { LocalisedApi } from '../LocalisedApi'
import { DebugI18n } from '@/src/i18n'

let api: LocalisedApi
let i18n = new DebugI18n()

beforeEach(async () => {
  api = new LocalisedApi({}, {}, {})
  api.setLocaliser(i18n.makeInstance('en'))
})

describe('LocalisedApi', () => {
  describe('#makeEnvelope', () => {
    it('should a translate single messages', async () => {
      let messages = 'code.a'
      let envelope = api.makeEnvelope(true, messages, 200, null)
      
      expect(envelope.meta.messages).toEqual([ 'en:code.a:' ])
      expect(envelope.meta.codes).toEqual([ 'code.a' ])
    })
    it('should a translate multiple messages', async () => {
      let messages = [ 'code.a', 'code.b' ]
      let envelope = api.makeEnvelope(true, messages, 200, null)
      
      expect(envelope.meta.messages).toEqual([ 'en:code.a:', 'en:code.b:' ])
      expect(envelope.meta.codes).toEqual([ 'code.a', 'code.b' ])
    })
  })
})
