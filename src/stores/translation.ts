
import { get, writable } from 'svelte/store';

import { us_en } from '../lib/translations/us_en';

export let tl = writable(us_en);
