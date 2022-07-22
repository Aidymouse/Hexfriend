<script lang="ts">
	import * as PIXI from 'pixi.js';
	import { createEventDispatcher } from 'svelte';

	let dispatch = createEventDispatcher();

	export let value: number = 0x000000;

	export let label: string = null;
	export let name: string = null;

	export let w = 25;
	export let h = 25;

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

<span>
	<div style="--bg-color: {stringValue}; width: {w}px; height: {h}px">
		<input type="color" bind:value={stringValue} id={name} />
	</div>

	{#if label}
		<label for={name}>{label}</label>
	{/if}
</span>

<style>
	span {
		display: flex;
		gap: 10px;
		align-items: center;
	}

	div {
		border-radius: 50%;
		overflow: none;
		border: solid 2px #f2f2f2;
		box-sizing: border-box;
		background-color: var(--bg-color);

		width: 100%;
		height: 100%;
		transition-duration: 0.2s;
		transition-property: border-color;
	}

	div:hover {
		border-color: #8cc63f;
		transition-duration: 0.2s;
		transition-property: border-color;
	}

	input {
		width: 100%;
		height: 100%;
		opacity: 0;
	}
</style>
