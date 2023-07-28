import { get, writable } from 'svelte/store';

export let store_inputs = writable({
	mouseDown: [false, false, false, false, false],

	controlKeysDown: {
		shift: false,
		control: false,
		alt: false,
	},

	editableHasFocus: false,
});
