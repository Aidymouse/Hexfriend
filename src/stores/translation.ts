
import { get, writable } from 'svelte/store';

import { en_us } from '../lib/translations';

export let tl = writable(en_us);
