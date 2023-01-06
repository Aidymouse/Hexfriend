<script lang="ts">
	import ColorInputPixi from '../components/ColorInputPixi.svelte';
	import { getHexPath } from '../helpers/hexHelpers';
	import * as store_tfield from '../stores/tfield';
	import type { icon_data } from '../types/data';
	import type { Icon, Iconset } from '../types/icon';
	import * as PIXI from 'pixi.js';
	import type { terrain_field } from 'src/types/terrain';

	import { get_icon_texture } from '../lib/texture_loader';
	import { afterUpdate, onMount } from 'svelte';

	export let loadedIconsets: Iconset[];
	export let app: PIXI.Application;

	export let data_icon: icon_data;

	let tfield: terrain_field;
	store_tfield.store.subscribe((newTField) => {
		tfield = newTField;
	});

	let iconPreview = '';

	function selectIcon(iconData: Icon) {
		data_icon.texId = iconData.texId;
		data_icon.color = iconData.color;
		data_icon.pHex = iconData.pHex;

		data_icon.usingEraser = false;
	}

	let spr_preview = new PIXI.Sprite();
	let grph_preview = new PIXI.Graphics();
	let cont_preview = new PIXI.Container();
	cont_preview.addChild(grph_preview, spr_preview);

	function getIconScale(hexWidth: number, hexHeight: number): number {
		let scale: number;
		if (hexWidth < hexHeight) {
			scale = (hexWidth * (data_icon.pHex / 100)) / get_icon_texture(data_icon.texId).width;
		} else {
			scale = (hexHeight * (data_icon.pHex / 100)) / get_icon_texture(data_icon.texId).height;
		}

		return scale;
	}

	async function getIconPreview(iconData: icon_data): Promise<string> {
		let hW = 50;
		let hH = 45;

		if (tfield.orientation == 'pointyTop') {
			hW = 45;
			hH = 50;
		}

		let path = getHexPath(hW, hH, tfield.orientation, 0, 0);
		grph_preview.clear();
		grph_preview.beginFill(tfield.blankHexColor);
		grph_preview.drawPolygon(path);
		grph_preview.endFill();

		spr_preview.texture = get_icon_texture(data_icon.texId);
		spr_preview.tint = iconData.color;
		spr_preview.anchor.set(0.5, 0.5);
		spr_preview.scale.set(getIconScale(hW, hH));

		let b64 = await app.renderer.extract.base64(cont_preview); //PIXI.autoDetectRenderer().plugins.extract.base64(c)

		return b64;
	}

	function iconMatchesData(icon: Icon): boolean {
		if (data_icon.color != icon.color) return false;
		if (data_icon.texId != icon.texId) return false;
		return true;
	}

	afterUpdate(async () => {
		loadedIconsets = loadedIconsets;
		tfield.orientation = tfield.orientation;
		iconPreview = await getIconPreview(data_icon);
	})

	onMount(async () => {
		//iconPreview = await getIconPreview(data_icon);
	})

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

		<!--
		<span class="icon-preview-control-row">
			<Checkbox id={'cb_snapIcon'} bind:checked={data_icon.snapToHex} />
			<label for="cb_snapIcon">Snap to Hex Center</label>
		</span>
		-->

		<span class="icon-preview-control-row" style="grid-column: 1/3;">
			<input type="range" id="iconSize" min={10} max={100} bind:value={data_icon.pHex} style="margin-bottom: 0;" />
		</span>

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

	#dragmode {
		position: absolute;
		top: 10px;
		right: 45px;
		width: 25px;
		height: 25px;
		padding: 2px;
	}
</style>
