<script lang="ts">
	import { checkboxBase64 } from '../types/data';
	import { createEventDispatcher } from 'svelte';

	export let checked: boolean;

	export let id: string = null;

	const disaptch = createEventDispatcher();
</script>

<span>
	<div class="cb" class:checked>
		<input
			{id}
			type="checkbox"
			bind:checked
			on:change={() => {
				disaptch('change');
			}}
		/>
		{#if checked}
			<img src={checkboxBase64} alt="Check" />
		{/if}
	</div>
</span>

<style>
	span {
		display: flex;
		align-items: center;
	}

	.cb {
		width: 1.5em;
		height: 1.5em;
		border: solid 0.125em var(--text);
		box-sizing: border-box;
		border-radius: 0.25em;
		position: relative;
		background-color: var(--dark-background);

		display: flex;
		justify-content: center;
		align-items: center;

		transition-duration: 0.1s;
	}

	.cb img {
		width: 90%;
		height: 90%;
	}

	.cb:hover {
		background-color: var(--light-background);
	}

	.cb.checked {
		border-color: var(--primary);
	}

	.cb input {
		width: 100%;
		height: 100%;
		opacity: 0;
		position: absolute;
	}
</style>
