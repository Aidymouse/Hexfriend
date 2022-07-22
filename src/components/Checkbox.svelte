<script lang="ts">
	import { checkboxBase64 } from '/src/types/data';

	export let checked: boolean;

	export let name: string = null;
	export let label: string = null;
</script>

<span>
	<div class="cb" class:checked>
		<input id={name} type="checkbox" bind:checked />
		{#if checked}
			<img src={checkboxBase64} alt="check" />
		{/if}
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
