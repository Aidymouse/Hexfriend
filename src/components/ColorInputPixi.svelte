<script lang="ts">
	import * as PIXI from 'pixi.js';
	import { createEventDispatcher } from 'svelte';

	let dispatch = createEventDispatcher();

	export let value: number = 0x000000;

	export let label: string = null;
	export let id: string = null;

	export let w = "2em";
	export let h = "2em";

	let oldStringValue = PIXI.utils.hex2string(value);
	let stringValue = oldStringValue;

	$: {
		if (stringValue != oldStringValue) {
			/* If the old and new values dont match, then the value was changed on the input, not externally */
			value = PIXI.utils.string2hex(stringValue);
		} else {
			stringValue = PIXI.utils.hex2string(value);
		}
		oldStringValue = stringValue;

		dispatch('change', {});
	}
</script>

<span style="width: {w}; height: {h}">
	<div style="--user-input-color: {stringValue};">
		<input type="color" bind:value={stringValue} {id} />
	</div>
</span>

<style>
	span {
		display: flex;
		gap: 0.5em;
		align-items: center;
		justify-content: center;
	}

	div {
		border-radius: 50%;
		overflow: none;
		border: solid 0.125em var(--text);
		box-sizing: border-box;
		background-color: var(--user-input-color);

		width: 90%;
		height: 90%;
		transition-duration: 0.2s;
		transition-property: border-color;
	}

	div:hover {
		border-color: var(--hexfriend-green);
		transition-duration: 0.2s;
		transition-property: border-color;
	}

	input {
		width: 100%;
		height: 100%;
		opacity: 0;
	}
</style>
