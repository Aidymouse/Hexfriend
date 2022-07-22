<script lang="ts">
	import { coords_cubeToWorld } from '/src/helpers/hexHelpers';
	import { coords_cubeToq, coords_cubeTor } from '/src/helpers/hexHelpers';
	import { coord_system } from '/src/types/cordinates';
	import * as PIXI from 'pixi.js';
	import type { coordinates_data } from 'src/types/data';
	import type { TerrainHexField } from 'src/types/terrain';
	import { onMount } from 'svelte';
	import { Container, Text } from 'svelte-pixi';

	interface coordText {
		pixiText: PIXI.Text;
		parts: number[];
	}

	$: {
		Object.entries(texts).forEach(([hexId, text]) => {
			text.pixiText.style = data_coordinates.style;
		});
	}

	let texts: { [key: string]: coordText } = {}; // hex id: coordText

	let cont_textContainer = new PIXI.Container();

	export let tfield: TerrainHexField;
	export let data_coordinates: coordinates_data;

	function breakDownHexID(hexId: string) {
		let brokenId = hexId.split(':');
		return { q: Number(brokenId[0]), r: Number(brokenId[1]), s: Number(brokenId[2]) };
	}

	function createTextIfNoneExists(hexId: string) {
		//texts[hexId] = { text: "", x: 0, y: 0, parts: [] }

		if (!textExists(hexId)) {
			texts[hexId] = { pixiText: new PIXI.Text('', data_coordinates.style), parts: [] };
			texts[hexId].pixiText.anchor.x = 0.5;
			texts[hexId].pixiText.anchor.y = 1;
			cont_textContainer.addChild(texts[hexId].pixiText);
		}
	}

	export function generateAllCoords(system: coord_system) {
		cullUnusedCoordinates();

		Object.keys(tfield.hexes).forEach((hexId) => {
			createTextIfNoneExists(hexId);
			generateCoord(hexId, system);
		});
		updateAllCoordPositions();
	}

	export function generateCoord(hexId: string, system: coord_system = data_coordinates.system) {
		createTextIfNoneExists(hexId);

		generateCoordText(hexId);

		updateCoordPosition(hexId);
	}

	export function updateAllCoordPositions() {
		Object.entries(texts).forEach(([hexId, text]) => {
			updateCoordPosition(hexId);
		});
	}

	function updateCoordPosition(hexId: string) {
		let text = texts[hexId];

		let idParts = breakDownHexID(hexId);
		let newPos = coords_cubeToWorld(idParts.q, idParts.r, idParts.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight);

		text.pixiText.position.x = newPos.x;
		text.pixiText.position.y = newPos.y + tfield.hexHeight / 2 - data_coordinates.gap;
	}

	export function eliminateCoord(hexId) {
		cont_textContainer.removeChild(texts[hexId].pixiText);
		texts[hexId].pixiText.destroy();
		delete texts[hexId];
	}

	function generateCoordText(hexId, system: coord_system = data_coordinates.system) {
		switch (system) {
			case coord_system.CUBE: {
				let idParts = breakDownHexID(hexId);

				texts[hexId].parts = [idParts.q, idParts.r, idParts.s];
				texts[
					hexId
				].pixiText.text = `${texts[hexId].parts[0]}${data_coordinates.seperator}${texts[hexId].parts[1]}${data_coordinates.seperator}${texts[hexId].parts[2]}`;
				break;
			}

			case coord_system.ROWCOL: {
				let cube = breakDownHexID(hexId);
				let idParts =
					tfield.orientation == 'flatTop'
						? coords_cubeToq(tfield.raised, cube.q, cube.r, cube.s)
						: coords_cubeTor(tfield.raised, cube.q, cube.r, cube.s);

				texts[hexId].parts = [idParts.col, idParts.row];
				texts[hexId].pixiText.text = `${texts[hexId].parts[0]}${data_coordinates.seperator}${texts[hexId].parts[1]}`;

				break;
			}

			case coord_system.AXIAL: {
				let cube = breakDownHexID(hexId);

				//let newPos = coords_cubeToWorld(cube.q, cube.r, cube.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight)

				texts[hexId].parts = [cube.q, cube.r];
				texts[hexId].pixiText.text = `${texts[hexId].parts[0]}${data_coordinates.seperator}${texts[hexId].parts[1]}`;
				break;
			}
		}
	}

	export function updateAllCoordsText() {
		Object.entries(texts).forEach(([hexId, text]) => {
			generateCoordText(hexId);
		});
	}

	export function updateCoordText(hexId) {
		generateCoordText(hexId);
	}

	function textExists(hexId: string) {
		return texts[hexId] != null;
	}

	export function cullUnusedCoordinates() {
		Object.keys(texts).forEach((hexId) => {
			if (tfield.hexes[hexId] == null) {
				eliminateCoord(hexId);
			}
		});
	}

	onMount(() => {
		cullUnusedCoordinates();
		generateAllCoords(data_coordinates.system);
	});
</script>

{#if data_coordinates.shown}
	<Container instance={cont_textContainer} />
{/if}
