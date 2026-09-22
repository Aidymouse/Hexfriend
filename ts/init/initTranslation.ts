import { en_us } from '../translations/index.js'

const Translations = {
  'en_us': en_us
}

export const initTranslation = () => {
  globalThis.tl = Translations.en_us
}
