
import { persisted } from 'svelte-persisted-store';

import { type Translation, en_us, pt_br } from '../lib/translations';
import { placeholder_translation } from '../lib/translations/placeholder_translation';

export const tl = persisted('tl', en_us);

export const translation_map: {[key: string]: { translation: Translation, label: string }} = {
    "en_us": {translation: en_us, label: "🇺🇸 English"},
    "pt_br": {translation: pt_br, label: "🇧🇷 Portugues do Brasil"}
}

const merge_translation = (translation: Translation, merge: Translation) => {
    for (const [trans_key, trans_value] of Object.entries(translation)) {
        if (merge[trans_key] === undefined) continue;

        if (typeof trans_value === 'object') {
            translation[trans_key] = merge_translation(translation[trans_key], merge[trans_key])
        } else if (typeof trans_value === 'string') {
            translation[trans_key] = merge[trans_key]
        }
    }

    return translation
}

export const switch_translation = (new_translation: string) => {
    console.log(`Switching to ${new_translation}`);
    
    // Merge with placeholder
    let translation = translation_map[new_translation].translation
    translation = merge_translation(placeholder_translation, translation)

    console.log(translation)

    tl.set(translation)
    console.log(tl);
}


