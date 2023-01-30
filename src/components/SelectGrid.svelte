<script lang="ts">
	import { capitialize } from '../helpers/string';
	import { createEventDispatcher } from 'svelte';

	let dispatch = createEventDispatcher();

	export let options: { title: string; value: string; filename: string }[] = [];
	export let value: any;

	function changeValue(newValue: any) {
		if (value == newValue) return;
		value = newValue;
		dispatch('change', {});
	}
</script>

<main>
	{#each options as o}
		<div
			class="option"
			class:selected={value == o.value}
			on:click={() => {
				changeValue(o.value);
			}}
			title={capitialize(o.title)}
		>
			<div
				class="svg-bg"
				class:selected={value == o.value}
				style={`-webkit-mask: url(/assets/img/selectgrids/${o.filename}.svg)`}
				title={`${o.title}`}
			/>
		</div>
	{/each}
</main>

<style>
	main {
		background-color: var(--background);
		flex-direction: row;
		display: flex;
		height: 2em;
		border-radius: 0.5em;
		overflow: hidden;
	}

	.svg-bg {
		width: 100%;
		height: 100%;
		background-color: #f2f2f2;
	}

	.svg-bg.selected {
		background-color: #333333;
	}

	.option {
		height: 100%;
		aspect-ratio: 1/1;
		background-color: #222222;

		display: flex;
		align-items: center;
		justify-content: center;
		transition-duration: 0.1s;
		padding: 0.3em;
		box-sizing: border-box;
	}

	.option:hover {
		background-color: #777777;
		transition-duration: 0.1s;
	}

	.option.selected {
		background-color: var(--primary);
		outline: 0;
	}

	.option.selected:hover {
		background-color: var(--primary);
	}
</style>
