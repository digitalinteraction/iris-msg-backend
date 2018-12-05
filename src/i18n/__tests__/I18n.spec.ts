import { I18n } from '../I18n'
import { join } from 'path'

let i18n: I18n
beforeEach(async () => {
  i18n = new I18n(join(__dirname, '../../../locales'))
})

describe('I18n', () => {
  describe('#setup', () => {
    it('should load files', async () => {
      await i18n.setup()
      expect(i18n.locales).toEqual({
        en: expect.anything(),
        el: expect.anything()
      })
      expect(i18n.locales.en.api).toBeDefined()
    })
    it('should mark as setup', async () => {
      await i18n.setup()
      expect(i18n.isSetup).toBe(true)
    })
  })
  describe('#translate', () => {
    beforeEach(() => {
      i18n.isSetup = true
      i18n.locales = {
        en: {
          basic: 'Hello, World!',
          array: 'A: {0}, B: {1}',
          object: 'a: {a}, b: {b}'
        }
      }
    })
    
    it('should return the translated string', async () => {
      let text = i18n.translate('en', 'basic')
      expect(text).toEqual('Hello, World!')
    })
    
    it('should default to the key', async () => {
      let text = i18n.translate('en', 'unknown')
      expect(text).toEqual('unknown')
    })
    
    it('should process array args', async () => {
      let text = i18n.translate('en', 'array', [ 'first', 'second' ])
      expect(text).toEqual('A: first, B: second')
    })
    
    it('should process object args', async () => {
      let text = i18n.translate('en', 'object', {
        a: 'first', b: 'second'
      })
      expect(text).toEqual('a: first, b: second')
    })
  })
})
