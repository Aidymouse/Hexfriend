import { ScaleMode } from '../../helpers/imageSizing'
import { HexOrientation } from '../../types/terrain'
import { en_us } from './en_us'
import { type Translation } from './types'

/** This placeholder translation is used as a fallback for incomplete translations. Translations are merged with the placeholder when switched in */
export const placeholder_translation: Translation = structuredClone(en_us)

