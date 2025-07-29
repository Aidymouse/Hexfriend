
import { persisted } from 'svelte-persisted-store';

import { type Translation, en_us, pt_br } from '../lib/translations';

export const tl = persisted('tl', en_us);

export const translation_map: {[key: string]: { translation: Translation, label: string }} = {
    "en_us": {translation: en_us, label: "🇺🇸 English"},
    "pt_br": {translation: pt_br, label: "🇧🇷 Portugues do Brasil"}
}

export const switch_translation = (new_translation: string) => {
    console.log(`Switching to ${new_translation}`);
    tl.set(translation_map[new_translation].translation)
    console.log(tl);
}


