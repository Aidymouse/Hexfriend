<script lang="ts">
import type { hex_id } from 'src/types/toolData';

	import { genHexId, genHexId_tfieldHex, getNeighbours } from '../helpers/hexHelpers';
	import { download } from '../lib/download2';
	import * as store_tfield from '../stores/tfield';
	import type { TerrainHex, terrain_field } from '../types/terrain';
	import type { Tile, Tileset, tile_id } from '../types/tilesets';

	import { one_e_dmg_ruleset } from '../lib/generation_rulesets/one_e_dmg';

	export let loadedTilesets: Tileset[];
	let tfield: terrain_field;
	store_tfield.store.subscribe((newTField) => {
		tfield = newTField;
	});
	export let comp_terrainLayer;
	export let showTerrainGenerator: boolean;

	let importFiles: FileList;

	let selectedId = loadedTilesets[0].tiles[0].id;

	let gen_config_animate = false;
	let gen_config_clear = false;
	let gen_config_overwrite = true;

	interface rule {
		id: tile_id
		weight: number
	}

	type generation_ruleset = {[key: hex_id]: rule[]}

	let current_ruleset: generation_ruleset = JSON.parse(JSON.stringify(one_e_dmg_ruleset));
	let selector_ruleset = one_e_dmg_ruleset;
	// Populate the gen function
	/*
	loadedTilesets.forEach((tileset: Tileset) => {
		tileset.tiles.forEach((tile: Tile) => {
			current_ruleset[tile.id] = [{ id: tile.id, weight: 1 }];
		});
	});
	*/

	function rand(min: number, max: number): number {
		min = Math.ceil(min);
		max = Math.floor(max)+1;
		return Math.floor(Math.random() * (max - min) + min); //The maximum is now inclusive and the minimum is inclusive
	}

	function getTileFromId(tileId: tile_id) {
		let setId = tileId.split('_')[0];
		
		let tileset = loadedTilesets.find((tileset: Tileset) => tileset.id == setId);

		return tileset.tiles.find((tile: Tile) => tile.id == tileId);
	}

	function paint_hex(hex_id, tile, index) {
		
		if (gen_config_animate) {
			setTimeout(() => {comp_terrainLayer.paintFromTile(hex_id, tile)}, index*15)
		} else {
			comp_terrainLayer.paintFromTile(hex_id, tile)
		}

	}

	function pick_from_weighted(weighted_list: {item: any, weight: number}[]) {
		let total_weight = weighted_list.reduce( (total, cur_item) => total += cur_item.weight, 0 )
		let pick_value = rand(1, total_weight)

		let check_total = 0;
		for (const obj_index in weighted_list) {
			let obj = weighted_list[obj_index];
			check_total += obj.weight
			if (pick_value <= check_total) return obj.item; 
		}
	}

	// Wrapper for generation methods
	function generate() {
		let total_weights = 0
		Object.keys(current_ruleset).forEach(tile_id => {
			current_ruleset[tile_id].forEach(rule_part => {
				total_weights += rule_part.weight
			})
		})

		if (total_weights == 0) {
			console.log("Random!")
			gen_completely_random(tfield.hexes)
			return;
		}

		//standardGen(tfield.hexes, current_ruleset)
		gen_old_school_generate(tfield.hexes, current_ruleset);
		//comp_terrainLayer.renderAllHexes()
	}

	function gen_old_school_generate(hexes, ruleset: generation_ruleset) {

		// Get random hex that actually has a rule
		let valid_rule_ids: tile_id[] = Object.keys(ruleset).filter(tile_id => ruleset[tile_id].length > 0)
		let rand_tile_id = valid_rule_ids[rand(0, valid_rule_ids.length-1)]
		let rand_tile = getTileFromId(rand_tile_id)

		// Needs: random walks
		let prev_tile = rand_tile
		Object.keys(hexes).forEach( (hex_id, i) => {

			let rule = ruleset[prev_tile.id]
			let selected_id = pick_from_weighted(rule.map( rp => { return {item: rp.id, weight: rp.weight} }))
			let selected_tile = getTileFromId(selected_id)

			paint_hex(hex_id, selected_tile, i);

			prev_tile = selected_tile

		})

	}

	function gen_completely_random(hexes) {
		Object.keys(hexes).forEach( (hex_id, i) => {

			let rand_tileset = pick_from_weighted( loadedTilesets.map( ts => { return {item: ts, weight: Object.keys(ts.tiles).length} } ) );

			let ids = Object.keys(rand_tileset.tiles);
			let rand_tile = rand_tileset.tiles[rand(0, ids.length-1)];

			paint_hex(hex_id, rand_tile, i);
		})
	}

	/* Export Import */
	function exportGenFunction() {
		let name = prompt("What would you like to call this ruleset?")
		if (!name) return;

		download(JSON.stringify(current_ruleset), `${name}.hfgrs`, 'hexfriendgeneratorruleset');
	}

	function importGenFunction() {
		if (!importFiles[0]) return;

		let r = new FileReader();
		r.onload = (eb) => {
			current_ruleset = { ...JSON.parse(r.result as string) };
		};

		r.readAsText(importFiles[0]);
	}

	/* Modifying the ruleset */
	function removeTileFromFunction(tile_id: tile_id, id_to_remove: tile_id) {
		selector_ruleset = null
		
		let terrain = current_ruleset[tile_id].find((rule_part) => rule_part.id == id_to_remove);
		terrain.weight -= 1;

		if (terrain.weight < 1) current_ruleset[tile_id].splice(current_ruleset[tile_id].indexOf(terrain), 1);
		
		current_ruleset[tile_id] = current_ruleset[tile_id];
	}

	function addTileToFunction(tile_id: tile_id, id_to_add: tile_id) {
		selector_ruleset = null

		let rule = current_ruleset[tile_id];

		let rule_part = rule.find((rp) => rp.id == id_to_add);
		if (!rule_part) {
			rule_part = { id: id_to_add, weight: 0 }
			rule.push(rule_part);
		}
		rule_part.weight += 1;

		current_ruleset = current_ruleset;
	}

	function selector_ruleset_change() {
		console.log(selector_ruleset)
		if (selector_ruleset != null) current_ruleset = JSON.parse(JSON.stringify(selector_ruleset));
		current_ruleset = current_ruleset;
	}

	function clear_ruleset() {
		if (!confirm("Are you sure?")) return;

		Object.keys(current_ruleset).forEach(tile_id => {
			current_ruleset[tile_id] = []
		})

		current_ruleset = current_ruleset
	}
</script>

<main class="panel">

	<div id="buttons">
		{#each Object.keys(current_ruleset) as tileId}
			<div class="terrain-category">
				<button
					on:click={() => {
						selectedId = tileId;
					}}
					class:selected={selectedId == tileId}
				>
					<img src={getTileFromId(tileId).preview} alt={getTileFromId(tileId).display} /></button
				>

				<div class="added-ids">
					{#each current_ruleset[tileId] as allowedData}
						<div
							class="added-tile"
							on:click={() => {
								removeTileFromFunction(tileId, allowedData.id);
							}}
						>
							<img src={getTileFromId(allowedData.id).preview} alt={allowedData.id} />
							<p class="weight-container">{allowedData.weight}</p>
							<!-- Weight has to absolute but also float in middle, hence the container -->
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<div id="add-tiles">
		{#if selectedId != ''}
			{#each loadedTilesets as tileset}
				{#each tileset.tiles as tile (tile.id)}
					<button
						on:click={() => {
							addTileToFunction(selectedId, tile.id);
						}}
					>
						<img src={tile.preview} alt={tile.id} title={`Add ${tile.display} to generation ruleset`} />
					</button>
				{/each}
			{/each}
		{/if}
	</div>

	<div id="generator-controls">
		<button
			id="generate-button"
			on:click={() => {
				generate();
			}}>Generate!</button
		>
		<button
			on:click={() => {
				exportGenFunction();
			}}>Export</button
		>
		<button id="import-button"
			><input
				type="file"
				bind:files={importFiles}
				on:change={() => {
					importGenFunction();
				}}
			/>Import</button
		>
		<button
			on:click={() => {
				showTerrainGenerator = false;
			}}>Close Generator</button
		>
		<button on:click={clear_ruleset}>Clear Ruleset</button>
		<div><input type="checkbox" bind:checked={gen_config_animate} /> Animate Generator</div>
		<div><input type="checkbox" bind:checked={gen_config_clear} /> Clear Before Generation</div>
		<div><input type="checkbox" bind:checked={gen_config_overwrite} /> Overwrite Filled Hexes</div>
		<div> <select bind:value={selector_ruleset} on:change={selector_ruleset_change}>
			<option value={one_e_dmg_ruleset}>AD&D 1e DMG</option>
			<option value={null}>Custom</option>
		</select> </div>
	</div>
</main>

<style>
	main {
		width: 600px;
		height: 80%;
		position: absolute;
		top: 1em;
		right: 1em;
		padding: 1em;

		display: grid;
		gap: 5px;
		grid-template-columns: 1fr 11em;
		grid-template-rows: 1fr auto;
		box-sizing: border-box;
		background-color: var(--primary-background);
	}

	#buttons {
		display: flex;
		flex-direction: column;
		gap: 0.25em;

		overflow-y: scroll;
		height: 100%;
	}

	#add-tiles {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		grid-auto-rows: auto;
		gap: 0.25em;
		padding: 0.25em;
		background-color: var(--light-background);
		border-radius: var(--small-radius);
		overflow: scroll;
	}

	#add-tiles button {
		aspect-ratio: 1/1;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#add-tiles button img {
		width: 90%;
	}



	/* Big Rows */
	.terrain-category {
		display: flex;
		gap: 0.5em;
		background-color: var(--light-background);
		border-radius: var(--small-radius);
	}

	.terrain-category button {
		background-color: transparent;
	}

	.terrain-category button:hover {
		background-color: var(--lighter-background);
	}

	.terrain-category button.selected {
		background-color: var(--lighter-background);
		outline: none;
		box-sizing:content-box;
	}



	/* Added IDs */
	.added-ids {
		display: flex;
		flex-wrap: wrap;
		box-sizing: border-box;
		gap: 0.25em;
	}

	.added-ids img {
		height: 2em;
	}



	/* Added Tile in the ;ost */
	.added-ids .added-tile {
		position: relative;
		width: 3em;
		height: 3em;
		
		display: flex;
		align-items: center;
		justify-content: center;

	}

	.added-tile:hover {
		outline: var(--secondary) solid 2px;
		border-radius: var(--small-radius);
	}
	
	.added-tile p {
		
		position: absolute;
		right: 0px;
		bottom: 0px;
		height: 40%;
		width: 40%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--primary-background);
		border-radius: 50%;
		padding: 0px;
		margin: 0px;
		opacity: 0.8;
		user-select: none;

	}

	

	/* Controls */
	#import-button {
		position: relative;
	}

	#import-button input {
		position: absolute;
		opacity: 0;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}



	/* Help */
	#help-button {
		position: absolute;
		left: -2em;
		width: 2em;
		height: 2em;
		background-color: var(--primary-background);
	}
</style>
