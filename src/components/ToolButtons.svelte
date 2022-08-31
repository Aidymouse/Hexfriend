<script lang="ts">
	import type { path_data } from '../types/data';
	import { tools } from '../types/toolData';

	let buttons = [
		{ display: 'Terrain', toolCode: tools.TERRAIN },
		{ display: 'Icon', toolCode: tools.ICON },
		{ display: 'Path', toolCode: tools.PATH },
		{ display: 'Text', toolCode: tools.TEXT },
		{ display: 'Eraser', toolCode: tools.ERASER },
	];

	export let selectedTool: string;
	export let hexOrientation: 'flatTop' | 'pointyTop';

	export let changeTool: Function;
</script>

<main>
	{#each buttons as b}
		<button
			class={selectedTool == b.toolCode ? 'selected' : ''}
			on:click={(e) => {
				changeTool(b.toolCode);
			}}
			title={`${b.display} Tool`}
		>
			{#if b.toolCode == 'terrain'}
				<img src={`/assets/img/tools/${b.toolCode}_${hexOrientation == 'flatTop' ? 'ft' : 'pt'}.png`} alt={`${b.display} Tool`} />
			{:else}
				<img src={`/assets/img/tools/${b.toolCode}.png`} alt={`${b.display} Tool`} />
			{/if}
		</button>
	{/each}
</main>

<style>
	main {
		display: grid;
		grid-template-columns: 50px;
		grid-template-rows: 50px;
		grid-auto-rows: 50px;
		gap: 10px;
	}

	main button {
		width: 50px;
		height: 50px;
	}

	button {
		display: flex;
		align-items: center;
		justify-content: center;
		transition-duration: 0.2s;
	}

	.selected {
		border-color: #8cc63f;
		outline: #8cc63f solid 1px;
		transition-duration: 0.2s;
	}
</style>
