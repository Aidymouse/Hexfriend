import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

import importAssets from 'svelte-preprocess-import-assets';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [importAssets(), preprocess()], //,

	kit: {
		adapter: adapter()
	}
};

export default config;
