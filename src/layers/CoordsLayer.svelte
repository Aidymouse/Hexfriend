<script lang="ts">
	// Small random bug that i'll come investigate later: if you change orientation, then raised col/indented row, then change orientation again, hex at (col.row) (1.0) or (1.1) will be duplicated??
	import { coords_cubeToWorld, genHexId } from '../helpers/hexHelpers';
	import { coords_cubeToq, coords_cubeTor } from '../helpers/hexHelpers';
	import * as store_tfield from '../stores/tfield';
	import { store_has_unsaved_changes } from '../stores/flags';
	import { coord_system } from '../types/coordinates';
	import type { coordinates_data } from '../types/data';
	import type { TerrainHex, terrain_field } from '../types/terrain';
	import type { hex_id } from '../types/toolData';
	import * as PIXI from 'pixi.js';
	import { onMount } from 'svelte';
	import { map_shape } from '../types/settings';

	interface coordText {
		pixiText: PIXI.Text;
		parts: number[];
	}

	$: {
		Object.entries(coordTexts).forEach(([hexId, text]) => {
			text.pixiText.style = data_coordinates.style;
		});

		cont_textContainer.visible = data_coordinates.shown
	}

	let coordTexts: { [key: hex_id]: coordText } = {}; // hex id: coordText

	export let cont_coordinates;
	let cont_textContainer = new PIXI.Container();
	cont_coordinates.addChild(cont_textContainer);

	let tfield: terrain_field;
	store_tfield.store.subscribe((newTField) => {
		tfield = newTField;
	});

	export let data_coordinates: coordinates_data;

	function breakDownHexID(hexId: hex_id) {
		let brokenId = hexId.split(':');
		return { q: Number(brokenId[0]), r: Number(brokenId[1]), s: Number(brokenId[2]) };
	}

	function coordTextExists(hexId: hex_id) {
		return coordTexts[hexId] != null;
	}

	function generateAllCoords(system: coord_system) {
		Object.keys(tfield.hexes).forEach((hexId: hex_id) => {
			generateNewCoord(hexId, system);
		});
		$store_has_unsaved_changes = true;
	}

	export function populateBlankHexes() {
		Object.keys(tfield.hexes).forEach((hexId: hex_id) => {
			if (!coordTextExists(hexId)) generateNewCoord(hexId);
		});

		if (tfield.mapShape == map_shape.FLOWER && data_coordinates.system == coord_system.LETTERNUMBER) {
			updateAllCoordsText();
		}
		$store_has_unsaved_changes = true;
	}

	export function generateNewCoord(hexId: hex_id, system: coord_system = data_coordinates.system) {
		if (coordTextExists(hexId)) {
			console.log(`You already have a text at ${hexId}! Use updateCoord() instead, goofball.`);
		}

		coordTexts[hexId] = { pixiText: new PIXI.Text('', data_coordinates.style), parts: [] };
		coordTexts[hexId].pixiText.anchor.x = 0.5;
		coordTexts[hexId].pixiText.anchor.y = 1;
		cont_textContainer.addChild(coordTexts[hexId].pixiText);

		let generated = generateCoordTextAndParts(hexId);

		coordTexts[hexId].pixiText.text = generated.text;
		coordTexts[hexId].parts = [...generated.parts];

		updateCoordPosition(hexId);
		$store_has_unsaved_changes = true;
	}

	export function updateAllCoordPositions() {
		Object.keys(coordTexts).forEach((hexId: hex_id) => {
			updateCoordPosition(hexId);
		});

		if (data_coordinates.system == coord_system.LETTERNUMBER) {
			updateAllCoordsText();
		}

		$store_has_unsaved_changes = true;
	}

	function updateCoordPosition(hexId: hex_id) {
		let text = coordTexts[hexId];

		let idParts = breakDownHexID(hexId);
		let newPos = coords_cubeToWorld(idParts.q, idParts.r, idParts.s, tfield.orientation, tfield.hexWidth + tfield.grid.gap, tfield.hexHeight + tfield.grid.gap);

		text.pixiText.position.x = newPos.x;
		text.pixiText.position.y = newPos.y + tfield.hexHeight / 2 - data_coordinates.gap;
	}

	export function eliminateCoord(hexId: hex_id) {
		cont_textContainer.removeChild(coordTexts[hexId].pixiText);
		coordTexts[hexId].pixiText.destroy();
		delete coordTexts[hexId];

		$store_has_unsaved_changes = true;
	}

	function generateCoordTextAndParts(hexId: hex_id, system: coord_system = data_coordinates.system): { parts: number[]; text: string } {

		let row_offset = 0
		let col_offset = 0

		switch (system) {
			case coord_system.CUBE: {
				let idParts = breakDownHexID(hexId);

				let parts = [idParts.q, idParts.r, idParts.s];

				return {
					parts: [idParts.q, idParts.r, idParts.s],
					text: `${parts[0]}${data_coordinates.seperator}${parts[1]}${data_coordinates.seperator}${parts[2]}`,
				};
			}

			case coord_system.ROWCOL: {
				let cube = breakDownHexID(hexId);
				let idParts =
					tfield.orientation == 'flatTop'
						? coords_cubeToq(tfield.raised, cube.q, cube.r, cube.s)
						: coords_cubeTor(tfield.raised, cube.q, cube.r, cube.s);

				let parts = [idParts.col, idParts.row];

				return {
					parts: [idParts.col, idParts.row],
					text: `${ (parts[0] < 10 && parts[0] >= 0) ? 0 : ''}${parts[0]}${data_coordinates.seperator}${(parts[1] < 10 && parts[1] >= 0) ? 0 : ''}${parts[1]}`,
				};
			}

			case coord_system.AXIAL: {
				let cube = breakDownHexID(hexId);

				let parts = [cube.q, cube.r];

				return {
					parts: [cube.q, cube.r],
					text: `${parts[0]}${data_coordinates.seperator}${parts[1]}`,
				};
			}

			case coord_system.LETTERNUMBER: {
		
				if (tfield.mapShape == map_shape.FLOWER) {
					row_offset = tfield.hexesOut
					col_offset = tfield.hexesOut
				}

				let cube = breakDownHexID(hexId);

				let idParts = tfield.orientation == 'flatTop'
						? coords_cubeToq(tfield.raised, cube.q, cube.r, cube.s)
						: coords_cubeTor(tfield.raised, cube.q, cube.r, cube.s);
				
				

				// Convert column to letter
				let parts = [ num_to_alphabet(idParts.col+col_offset+1), idParts.row+row_offset+1 ];

				return {
					parts: parts,
					text: `${parts[0]}${data_coordinates.seperator}${parts[1]}`
				}
				
			}
		}

		$store_has_unsaved_changes = true;
	}

	function num_to_alphabet(num) {
		let n = num
		let col_name = "";
		let alphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I","J","K", "L", "M", "N", "O", "P","Q", "R", "S", "T","U", "V", "W", "X", "Y", "Z"];

		while (n > 0) {
			let mod = (n-1) % 26;
			col_name = alphabet[mod] + col_name;
			n = Math.round((n - mod) / 26);
			console.log(n)
		}


		return col_name;


	}

	export function updateAllCoordsText() {
		Object.keys(coordTexts).forEach((hexId: hex_id) => {
			updateCoordText(hexId);
		});
		$store_has_unsaved_changes = true;
	}

	export function updateCoordText(hexId: hex_id) {
		let generated = generateCoordTextAndParts(hexId, data_coordinates.system);
		coordTexts[hexId].parts = [...generated.parts];
		coordTexts[hexId].pixiText.text = generated.text;
		$store_has_unsaved_changes = true;
	}

	export function cullUnusedCoordinates() {
		Object.keys(coordTexts).forEach((hexId: hex_id) => {
			if (tfield.hexes[hexId] == null) {
				eliminateCoord(hexId);
			}
		});

		if (tfield.mapShape == map_shape.FLOWER && data_coordinates.system == coord_system.LETTERNUMBER) {
			updateAllCoordsText();
		}

		$store_has_unsaved_changes = true;
	}

	onMount(() => {
		cont_coordinates.removeChildren(0);

		cont_textContainer = new PIXI.Container();
		cont_coordinates.addChild(cont_textContainer);

		cullUnusedCoordinates();
		generateAllCoords(data_coordinates.system);
	});
</script>

