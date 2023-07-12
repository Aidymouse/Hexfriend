<script lang="ts">
	import type { pan_state } from '../types/panning';
	import type { hex_id } from '../types/toolData';
	import type { terrain_field } from '../types/terrain';

	import { hex_orientation, hex_raised } from '../types/terrain';

	import * as store_panning from '../stores/panning';
	import * as store_tfield from '../stores/tfield';
	
	import { getHexPath } from '../helpers/hexHelpers';
	import * as PIXI from 'pixi.js'
	import { afterUpdate, onMount } from 'svelte';

	import * as hex_helpers from '../helpers/hexHelpers';
	
	import { map_shape } from '../types/settings';

	export let cont_largehexes: PIXI.Container;
	let grph_largehexes = new PIXI.Graphics();

	$: { 
		grph_largehexes.visible = tfield.largehexes.shown
	}

	let tfield: terrain_field;
	store_tfield.store.subscribe((newTField) => {
		tfield = newTField;
	});

	let panning: pan_state;
	store_panning.store.subscribe((newPanning) => {
		panning = newPanning;
	});

	function square_drawlargehexes(bigWidth, bigHeight) {
		let bigRows = Math.round(tfield.rows / tfield.largehexes.diameterInHexes);

		let span = bigWidth / tfield.hexWidth;
		let bigCols = Math.round(tfield.columns / span);

		if (bigRows < 1) bigRows = 1;
		if (bigCols < 1) bigCols = 1;

		let zeroOffsetX = tfield.largehexes.offset.x * tfield.hexWidth; //+ store_panning.curWorldX()
		let zeroOffsetY = tfield.largehexes.offset.y * tfield.hexHeight; //+ store_panning.curWorldY()

		

		let encompassMod = tfield.largehexes.encompassEdges ? 1 : 0;

		for (let bigRow = 0 - encompassMod; bigRow < bigRows + encompassMod; bigRow++) {
			for (let bigCol = 0 - encompassMod; bigCol < bigCols + encompassMod; bigCol++) {
				let bigHexX, bigHexY;
				let raisedMod = tfield.largehexes.raised == hex_raised.EVEN ? -1 : 1;

				if (tfield.orientation == hex_orientation.FLATTOP) {
					bigHexX = bigCol * bigWidth * 0.75 + zeroOffsetX;
					bigHexY = bigRow * bigHeight + (Math.abs(bigCol % 2) == 1 ? bigHeight / 2 : 0) * raisedMod + zeroOffsetY;
				} else {
					bigHexX = bigCol * bigWidth + (Math.abs(bigRow % 2) == 1 ? bigWidth / 2 : 0) * raisedMod + zeroOffsetX;
					bigHexY = bigRow * bigHeight * 0.75 + zeroOffsetY;
				}

				let bigHexPath = getHexPath(bigWidth, bigHeight, tfield.orientation, bigHexX, bigHexY);
				grph_largehexes.drawPolygon(bigHexPath);
			}
		}

	}

	function flower_drawlargehexes(big_width, big_height) {

		let hexes_out = tfield.hexesOut / tfield.largehexes.diameterInHexes + (tfield.largehexes.encompassEdges ? 1 : 0)

		for (let ring=0; ring<hexes_out; ring++) {
			for (const hex_id of hex_helpers.getRing("0:0:0", ring)) {
				let hex_coords = hex_helpers.id_to_coords(hex_id)
				let big_hex_coords = hex_helpers.coords_cubeToWorld(hex_coords.q, hex_coords.r, hex_coords.s, tfield.orientation, big_width, big_height, 0)

				let hX = big_hex_coords.x+tfield.largehexes.offset.x*tfield.hexWidth
				let hY =  big_hex_coords.y+tfield.largehexes.offset.y*tfield.hexHeight
				let big_hex_path = getHexPath(big_width, big_height, tfield.orientation, hX, hY)

				grph_largehexes.drawPolygon(big_hex_path)
			}
		}

	}

	afterUpdate(() => {
		grph_largehexes.clear();

		let ratio;
		let bigHeight;
		let bigWidth;

		if (tfield.orientation == hex_orientation.FLATTOP) {
			ratio = tfield.hexWidth / tfield.hexHeight;

			bigHeight = tfield.hexHeight * tfield.largehexes.diameterInHexes;
			bigWidth = bigHeight * ratio;
		} else {
			ratio = tfield.hexHeight / tfield.hexWidth;
			bigWidth = tfield.hexWidth * tfield.largehexes.diameterInHexes;
			bigHeight = bigWidth * ratio;
		}

		grph_largehexes.lineStyle(tfield.largehexes.style.width, tfield.largehexes.style.color);

		if (tfield.mapShape == map_shape.SQUARE) {
			square_drawlargehexes(bigWidth, bigHeight)

		} else if (tfield.mapShape == map_shape.FLOWER) {
			flower_drawlargehexes(bigWidth, bigHeight)

		}

	})

	onMount(() => {
		cont_largehexes.removeChildren(0);

		grph_largehexes = new PIXI.Graphics();
		grph_largehexes.visible = tfield.largehexes.shown
		cont_largehexes.addChild(grph_largehexes);
	})
</script>

<!--
{#if tfield.largehexes.shown}
	<Graphics
		draw={(g) => {
			g.clear();

			let ratio;
			let bigHeight;
			let bigWidth;

			if (tfield.orientation == hex_orientation.FLATTOP) {
				ratio = tfield.hexWidth / tfield.hexHeight;

				bigHeight = tfield.hexHeight * tfield.largehexes.diameterInHexes;
				bigWidth = bigHeight * ratio;
			} else {
				ratio = tfield.hexHeight / tfield.hexWidth;
				bigWidth = tfield.hexWidth * tfield.largehexes.diameterInHexes;
				bigHeight = bigWidth * ratio;
			}

			let bigRows = Math.round(tfield.rows / tfield.largehexes.diameterInHexes);

			let span = bigWidth / tfield.hexWidth;
			let bigCols = Math.round(tfield.columns / span);

			if (bigRows < 1) bigRows = 1;
			if (bigCols < 1) bigCols = 1;

			let zeroOffsetX = tfield.largehexes.offset.x * tfield.hexWidth; //+ store_panning.curWorldX()
			let zeroOffsetY = tfield.largehexes.offset.y * tfield.hexHeight; //+ store_panning.curWorldY()

			g.lineStyle(tfield.largehexes.style.width, tfield.largehexes.style.color);

			let encompassMod = tfield.largehexes.encompassEdges ? 1 : 0;

			for (let bigRow = 0 - encompassMod; bigRow < bigRows + encompassMod; bigRow++) {
				for (let bigCol = 0 - encompassMod; bigCol < bigCols + encompassMod; bigCol++) {
					let bigHexX, bigHexY;
					let raisedMod = tfield.largehexes.raised == hex_raised.EVEN ? -1 : 1;

					if (tfield.orientation == hex_orientation.FLATTOP) {
						bigHexX = bigCol * bigWidth * 0.75 + zeroOffsetX;
						bigHexY = bigRow * bigHeight + (Math.abs(bigCol % 2) == 1 ? bigHeight / 2 : 0) * raisedMod + zeroOffsetY;
					} else {
						bigHexX = bigCol * bigWidth + (Math.abs(bigRow % 2) == 1 ? bigWidth / 2 : 0) * raisedMod + zeroOffsetX;
						bigHexY = bigRow * bigHeight * 0.75 + zeroOffsetY;
					}

					let bigHexPath = getHexPath(bigWidth, bigHeight, tfield.orientation, bigHexX, bigHexY);
					g.drawPolygon(bigHexPath);
				}
			}
		}}
	/>
{/if}
	-->