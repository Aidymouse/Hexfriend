<script lang="ts">
	import { checkboxBase64 } from '../types/data';
	import {createEventDispatcher} from 'svelte';

	export let checked: boolean;

	export let id: string = null;

	const disaptch = createEventDispatcher();

</script>

<span>
	<div class="cb" class:checked>
		<input id={id} type="checkbox" bind:checked on:change={ () => {
			disaptch('change')
		} } />
		{#if checked}
			<img src={checkboxBase64} alt="check" />
		{/if}
	</div>
</span>

<style>
	span {
		display: flex;
		align-items: center;
	}

	.cb {
		width: 25px;
		height: 25px;
		border: solid 2px white;
		box-sizing: border-box;
		border-radius: 3px;
		position: relative;
		background-color: #222222;

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
		background-color: #555555;
	}

	.cb.checked {
		border-color: #8cc63f;
	}

	.cb input {
		width: 100%;
		height: 100%;
		opacity: 0;
		position: absolute;
	}
</style>
