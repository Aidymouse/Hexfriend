<script lang="ts">
	import { capitialize } from '../helpers/string';
	import { createEventDispatcher } from 'svelte';

	let dispatch = createEventDispatcher();

	export let values: any[] = [];
	export let value: any;

	export let filenamePrefix: string = '';

	function changeValue(newValue: any) {
		if (value == newValue) return;
		value = newValue;
		dispatch('change', {});
	}
</script>

<div id="border-container">
	<div id="grid">
		{#each values as v}
			<div
				class="option"
				class:selected={value == v}
				on:click={() => {
					changeValue(v);
				}}
				title={capitialize(v)}
			>
				<img src={`/assets/img/selectgrids/${filenamePrefix}${v}.png`} alt={`${v}`} />
			</div>
		{/each}
	</div>
</div>

<style>
	#border-container {
		border: solid 1px #555555;
		background-color: #555555;
		border-radius: 3px;
		display: inline-block;
	}

	#grid {
		display: flex;
		gap: 1px;
	}

	.option {
		width: 30px;
		height: 30px;
		background-color: #222222;

		display: flex;
		align-items: center;
		justify-content: center;
		transition-duration: 0.1s;
	}

	.option img {
		width: 70%;
	}

	.option:hover {
		background-color: #777777;
		transition-duration: 0.1s;
	}

	.selected {
		background-color: #8cc63f !important;
		transition-duration: 0s;
	}
</style>
