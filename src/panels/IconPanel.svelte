<script lang="ts">
	// TYPES
	import type { icon_data } from "../types/data";
	import type { Icon, Iconset } from "../types/icon";
	import type { terrain_field } from "../types/terrain";

	import ColorInputPixi from "../components/ColorInputPixi.svelte";
	import { getHexPath } from "../helpers/hexHelpers";
	import { get_icon_texture } from "../lib/texture_loader";
	import * as PIXI from "pixi.js";
	import { afterUpdate, onMount } from "svelte";

	// STORES
	import { tfield } from "../stores/tfield";
	import { data_icon } from "../stores/data";

	export let loadedIconsets: Iconset[];
	export let app: PIXI.Application;
	export let pHex: number;

	let iconPreview = "";

	function selectIcon(iconData: Icon) {
		$data_icon.texId = iconData.texId;
		$data_icon.color = iconData.color;

		$data_icon.usingEraser = false;
	}

	let spr_preview = new PIXI.Sprite();
	let grph_preview = new PIXI.Graphics();
	let cont_preview = new PIXI.Container();
	cont_preview.addChild(grph_preview, spr_preview);

	function getIconScale(hexWidth: number, hexHeight: number): number {
		let scale: number;
		if (hexWidth < hexHeight) {
			scale = (hexWidth * (pHex / 100)) / get_icon_texture($data_icon.texId).width;
		} else {
			scale = (hexHeight * (pHex / 100)) / get_icon_texture($data_icon.texId).height;
		}

		return scale;
	}

	async function getIconPreview(iconData: icon_data): Promise<string> {
		let hW = $tfield.hexWidth * 2;
		let hH = $tfield.hexHeight * 2;

		let path = getHexPath(hW, hH, $tfield.orientation, 0, 0);
		grph_preview.clear();
		grph_preview.beginFill($tfield.blankHexColor);
		grph_preview.drawPolygon(path);
		grph_preview.endFill();

		spr_preview.texture = get_icon_texture($data_icon.texId);
		spr_preview.tint = iconData.color;
		spr_preview.anchor.set(0.5, 0.5);
		spr_preview.scale.x = getIconScale(hW, hH);
		spr_preview.scale.y = getIconScale(hW, hH);

		let b64 = await app.renderer.extract.base64(cont_preview); //PIXI.autoDetectRenderer().plugins.extract.base64(c)

		return b64;
	}

	function iconMatchesData(icon: Icon): boolean {
		if ($data_icon.color != icon.color) return false;
		if ($data_icon.texId != icon.texId) return false;
		return true;
	}

	afterUpdate(async () => {
		loadedIconsets = loadedIconsets;
		$tfield.orientation = $tfield.orientation;
		iconPreview = await getIconPreview($data_icon);
	});

	onMount(async () => {
		//iconPreview = await getIconPreview(data_icon);
	});
</script>

<div class="panel">
	<div id="icon-preview">
		<div id="preview-image-centerer">
			<img
				src={iconPreview}
				alt={"Icon Preview"}
				class:flatTop={$tfield.orientation == "flatTop"}
				class:pointyTop={$tfield.orientation == "pointyTop"}
			/>
		</div>

		<span class="icon-preview-control-row">
			<ColorInputPixi
				bind:value={$data_icon.color}
				id={"iconPanelColor"}
			/>
			<label for="iconPanelColor">Icon Color</label>
		</span>

		<span class="icon-preview-control-row">
			<input
				type="range"
				id="iconSize"
				min={10}
				max={100}
				bind:value={pHex}
			/>
			<button
				class="outline-button"
				on:click={() => {
					pHex = 80;
				}}>Reset</button
			>
		</span>
	</div>

	<div id="buttons" class="scroll-container">
		{#each loadedIconsets as iconset (iconset.id)}
			{#if loadedIconsets.length > 1 || iconset.collapsed}
				<h2 class="iconset-heading">
					{iconset.name}
					<button
						on:click={() => {
							iconset.collapsed = !iconset.collapsed;
						}}
						><img
							class:rotated={iconset.collapsed}
							alt="Toggle Iconset Visibility"
							src={"/assets/img/ui/arrow.png"}
						/></button
					>
				</h2>
			{/if}

			<div class="button-grid" class:hidden={iconset.collapsed}>
				{#each iconset.icons as iconData}
					<button
						class="icon-button"
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

		<!-- This keeps the selector around. Hacky but... works! -->
		<div class="hidden" />
	</div>
</div>

<style>
	.hidden {
		display: none !important;
	}

	.iconset-heading:first-of-type {
		margin-top: 0;
	}

	.iconset-heading {
		display: flex;
		position: relative;
		align-items: center;

		border-color: var(--primary-background);
		margin-bottom: 0.25em;
		margin-top: 0.25em;
	}

	.iconset-heading button {
		position: absolute;
		box-sizing: border-box;
		display: flex;
		top: 0;
		right: 0;
		height: 2em;
		width: 3em;
		justify-content: center;
		align-items: center;
		background-color: transparent;
	}

	.iconset-heading button:hover {
		background-color: var(--primary-background);
	}

	.iconset-heading button img {
		height: 100%;
		transition-duration: 0.2s;
	}

	.iconset-heading button img.rotated {
		rotate: -180deg;
	}

	.icon-preview-control-row {
		display: flex;
		align-items: center;
		gap: 0.5em;
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
		color: var(--text);
	}

	#icon-preview {
		display: grid;
		grid-template-columns: 4em 1fr;
		grid-template-rows: 2em 2em;
		gap: 0.5em;
		background-color: var(--primary-background);
		padding: 1em;
	}

	#preview-image-centerer {
		grid-row: 1/3;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	#icon-preview img.flatTop {
		width: 100%;
	}

	#icon-preview img.pointyTop {
		height: 100%;
	}

	#buttons {
		background-color: var(--light-background);
		padding: 0.625em;
	}

	.button-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		grid-template-rows: auto;
		grid-auto-rows: auto;
		gap: 0.25em;
	}

	#buttons .icon-button {
		display: flex;
		align-items: center;
		justify-content: center;
		aspect-ratio: 1/1;
	}

	.icon-button img {
		width: 90%;
		height: auto;
	}
</style>
