
import { persisted } from 'svelte-persisted-store';

import { en_us, pt_br } from '../lib/translations';

export const tl = persisted('tl', pt_br);

export const translation_map = {
    "en_us": {translation: en_us, label: "🇺🇸 English"},
    "pt_br": {translation: pt_br, label: "🇧🇷 Portugues do Brasil (WIP)"}
}

export const switch_translation = (new_translation) => {
    console.log(`Switching to ${new_translation}`);
    tl.set(translation_map[new_translation].translation)
    console.log(tl);
}


