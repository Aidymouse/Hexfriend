<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	let dispatch = createEventDispatcher();

	export let value: string = '#000000';

	export let width: string = "2em";
	export let height: string = "2em";

	export let label: string = null;
	export let name: string = null;

	$: {
		value = value;
		dispatch('change', {});
	}
</script>

<main style="width: {width}; height: {height};">
	<div style="--bg-color: {value};">
		<input type="color" id={name} bind:value />
	</div>

	{#if label}
		<label for={name}> {label} </label>
	{/if}
</main>

<style>
	main {
		display: flex;
		color: white;
		align-items: center;
		justify-content: center;
	}

	div {
		border-radius: 50%;
		overflow: none;
		border: solid 2px white;
		box-sizing: border-box;
		background-color: var(--bg-color);

		width: 90%;
		height: 90%;
	}

	div:hover {
		border-color: #222222;
	}

	input {
		width: 100%;
		height: 100%;
		opacity: 0;
	}
</style>
