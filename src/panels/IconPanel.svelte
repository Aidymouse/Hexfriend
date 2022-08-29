<script lang="ts">
	import Checkbox from '../components/Checkbox.svelte';
	import ColorInputPixi from '../components/ColorInputPixi.svelte';
	import { getHexPath } from '../helpers/hexHelpers';
	import type { icon_data } from '../types/data';
	import type { Icon, Iconset } from '../types/icon';
	import * as PIXI from 'pixi.js';
	import type { terrain_field } from 'src/types/terrain';

	import * as store_tfield from '../stores/tfield';

	export let loadedIconsets: Iconset[];
	export let L: PIXI.Loader;
	export let app: PIXI.Application;

	export let data_icon: icon_data;

	export let iconTextureLookupTable;

	let tfield: terrain_field;
	store_tfield.store.subscribe(newTField => {
		tfield = newTField
	})

	let iconPreview = '';
	$: {
		iconPreview = getIconPreview(data_icon);
		loadedIconsets = loadedIconsets;

		tfield.orientation = tfield.orientation;
	}

	function selectIcon(iconData: Icon) {
		data_icon.texId = iconData.texId;
		data_icon.color = iconData.color;
		data_icon.pHex = iconData.pHex;

		data_icon.usingEraser = false;
	}

	let s = new PIXI.Sprite();
	let g = new PIXI.Graphics();
	let c = new PIXI.Container();
	c.addChild(g).addChild(s);

	function getIconScale(hexWidth: number, hexHeight: number): number {
		let scale: number;
		if (hexWidth < hexHeight) {
			scale = (hexWidth * (data_icon.pHex / 100)) / L.resources[getIconTextureId(data_icon.texId)].texture.width;
		} else {
			scale = (hexHeight * (data_icon.pHex / 100)) / L.resources[getIconTextureId(data_icon.texId)].texture.height;
		}

		return scale;
	}

	function getIconPreview(iconData: icon_data): string {
		let hW = 50;
		let hH = 45;

		if (tfield.orientation == 'pointyTop') {
			hW = 45;
			hH = 50;
		}

		let path = getHexPath(hW, hH, tfield.orientation, 0, 0);
		g.clear();
		g.beginFill(tfield.blankHexColor);
		g.drawPolygon(path);
		g.endFill();

		s.texture = L.resources[getIconTextureId(iconData.texId)].texture;
		s.tint = iconData.color;
		s.anchor.set(0.5, 0.5);
		s.scale.set(getIconScale(hW, hH));

		let b64 = app.renderer.plugins.extract.base64(c); //PIXI.autoDetectRenderer().plugins.extract.base64(c)

		return b64;
	}

	function iconMatchesData(icon: Icon): boolean {
		if (data_icon.color != icon.color) return false;
		if (getIconTextureId(data_icon.texId) != getIconTextureId(icon.texId)) return false;
		return true;
	}

	function getIconTextureId(id: string): string {
		if (Object.keys(iconTextureLookupTable).find((k) => k == id)) {
			return iconTextureLookupTable[id];
		}

		return id;
	}
</script>

<div class="panel">
	<div id="icon-preview">
		<div id="preview-image-centerer">
			<img
				src={iconPreview}
				alt={'Icon Preview'}
				class:flatTop={tfield.orientation == 'flatTop'}
				class:pointyTop={tfield.orientation == 'pointyTop'}
			/>
		</div>

		<span class="icon-preview-control-row">
			<ColorInputPixi bind:value={data_icon.color} w={25} h={25} id={'iconPanelColor'} />
			<label for="iconPanelColor">Icon Color</label>
		</span>

		<span class="icon-preview-control-row">
			<Checkbox id={'cb_snapIcon'} bind:checked={data_icon.snapToHex} />
			<label for="cb_snapIcon">Snap to Hex Center</label>
		</span>
		
		<span class="icon-preview-control-row" style="grid-column: 1/3;" >
			<input type="range" id="iconSize" min={10} max={100} bind:value={data_icon.pHex} style="margin-bottom: 0;" />
		</span>

		<button
			id="eraser"
			title={'Icon Eraser'}
			on:click={() => {
				data_icon.usingEraser = !data_icon.usingEraser;
			}}
			class:selected={data_icon.usingEraser}
		>
			<img src="/assets/img/tools/eraser.png" alt={'Eyedropper'} />
		</button>
	</div>

	<div id="buttons" class="scroll-container">
		{#each loadedIconsets as iconset (iconset.id)}
			{#if iconset.id != 'default'}
				<h2>{iconset.name}</h2>
			{/if}

			<div class="button-grid">
				{#each iconset.icons as iconData}
					<button
						class:selected={iconMatchesData(iconData)}
						on:click={() => {
							selectIcon(iconData);
						}}
						title={iconData.display}
					>
						<img src={iconData.preview} alt={iconData.display} />
					</button>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.icon-preview-control-row {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.panel {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto 1fr;
	}

	.scroll-container {
		min-height: 30%;
		max-height: 100%;
		height: auto;
		overflow-y: scroll;
	}

	div {
		color: white;
	}

	.selected {
		outline-style: solid;
		outline-width: 1px;
		outline-color: #8cc63f;
		border-color: #8cc63f;
	}

	#icon-preview {
		display: grid;
		grid-template-columns: 60px 1fr;
		grid-template-rows: 30px 30px;
		column-gap: 5px;
		background-color: #333333;
		padding: 10px;
	}

	#preview-image-centerer {
		grid-row: 1/3;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#icon-preview img.flatTop {
		width: 60px;
	}

	#icon-preview img.pointyTop {
		height: 60px;
	}

	#buttons {
		background-color: #555555;
		padding: 10px;
	}

	.button-grid {
		display: grid;
		grid-template-columns: repeat(5, 51px);
		grid-template-rows: 51px;
		grid-auto-rows: 51px;
		gap: 5px;
	}

	#buttons h2 {
		border-color: #333333;
		margin-bottom: 5px;
		margin-top: 10px;
	}

	#buttons button {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	button img {
		width: 90%;
		height: auto;
	}

	#eraser {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 25px;
		height: 25px;
		padding: 2px;
	}

	#eraser img {
		width: 100%;
		height: 100%;
		margin: 0;
	}
</style>