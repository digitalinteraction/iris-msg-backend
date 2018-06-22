import { join } from 'path'

import { I18n } from './I18n'
import { DebugI18n } from './DebugI18n'
import { LocalI18n } from './LocalI18n'

const AvailableLocales = [
  'en'
]

let basepath = join(__dirname, '../../locales')
let i18n = new I18n(basepath)

export { i18n, AvailableLocales, I18n, DebugI18n, LocalI18n }
