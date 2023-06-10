<script lang="ts">
	
	import { genHexId, genHexId_tfieldHex, getNeighbours } from '../helpers/hexHelpers';
	import { download } from '../lib/download2';
	import * as store_tfield from '../stores/tfield';
	import { rand, pick_from_weighted, random_choice } from '../helpers/random';
	import Checkbox from '../components/Checkbox.svelte';
	
	import type { hex_id } from 'src/types/toolData';
	import type { TerrainHex, terrain_field } from '../types/terrain';
	import type { Tile, Tileset, tile_id } from '../types/tilesets';
	
	import { one_e_dmg_ruleset } from '../lib/generation_rulesets/one_e_dmg';
	import { icy } from '../lib/generation_rulesets/icy';
	import { jungle } from '../lib/generation_rulesets/jungle';

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

	function getTileFromId(tileId: tile_id) {
		let setId = tileId.split('_')[0];
		
		let tileset = loadedTilesets.find((tileset: Tileset) => tileset.id == setId);

		return tileset.tiles.find((tile: Tile) => tile.id == tileId);
	}

	function paint_hex(hex_id, tile, index) {
		
		comp_terrainLayer.paintFromTile(hex_id, tile, !gen_config_animate)
		if (gen_config_animate) {
			setTimeout(() => {comp_terrainLayer.renderHex(hex_id)}, index*15)
		}

	}

	// Wrapper for generation methods
	function generate() {
		console.log(current_ruleset)

		// Get length of empty hexes
		let blank_hexes = Object.keys(tfield.hexes).filter(hex_id => tfield.hexes[hex_id].tile == null)
		let clear_override = false
		if (blank_hexes.length == 0 && !gen_config_clear) {
			clear_override = confirm("No blank hexes to generate in. Would you like to clear all hexes before generation?")
			if (!clear_override) return
		}

		if (gen_config_clear || clear_override) {
			Object.keys(tfield.hexes).forEach(hex_id => {
				comp_terrainLayer.eraseHex(hex_id);
			})
		}

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
		// Meanders through hexes on random walks

		// Get random hex that actually has a rule
		let valid_rule_ids: tile_id[] = Object.keys(ruleset).filter(tile_id => ruleset[tile_id].length > 0)
		let rand_tile_id = valid_rule_ids[rand(0, valid_rule_ids.length-1)]
		let rand_tile = getTileFromId(rand_tile_id)
		
		let prev_tile = rand_tile

		let hexes_to_visit = Object.keys(hexes)
		hexes_to_visit = hexes_to_visit.filter(hex_id => tfield.hexes[hex_id].tile == null)
		let visited = []
		let visit_hex_id = random_choice(hexes_to_visit) 

		let painted_count = 0
		let latest_length = -1

		// Needs: random walks
		while (hexes_to_visit.length > 0) {
			
			// Paint the current hex
			//console.log(visit_hex_id);
			let visit_hex = hexes[visit_hex_id]
			
			let rule = ruleset[prev_tile.id]
			if (rule.length == 0) return;
			let selected_id = pick_from_weighted(rule.map( rp => { return {item: rp.id, weight: rp.weight} }))
			let selected_tile = getTileFromId(selected_id)
			
			paint_hex(visit_hex_id, selected_tile, painted_count);
			painted_count += 1
			
			// Remove it's ID from the list
			hexes_to_visit = hexes_to_visit.filter(id => id != visit_hex_id)

			if (latest_length == hexes_to_visit.length) return // Fail safe in case loop screws up
			latest_length = hexes_to_visit.length
			
			// Choose random neighbour (random blank neighbour if not overwriting)
			let neighbours = comp_terrainLayer.get_existant_neighbours(visit_hex_id)
			neighbours = neighbours.filter(n_hex => hexes_to_visit.find(id => genHexId_tfieldHex(n_hex) == id)) // Remove hexes that have already been visited
			visited.push(visit_hex_id)
			//if (!gen_config_overwrite) neighbours = neighbours.filter(n_hex => n_hex.tile == null) // Get rid of any hexes that are already filled

			if (hexes_to_visit.length < 1) break;
			
			prev_tile = selected_tile

			if (neighbours.length == 0) {
				visit_hex_id = random_choice(hexes_to_visit)
				// Choose a random filled in and visited neighbour, if any, to be the previous tile
				let next_neighbours = comp_terrainLayer.get_existant_neighbours(visit_hex_id)
				next_neighbours = next_neighbours.filter(n_hex => n_hex.tile != null && visited.find(id => id == genHexId_tfieldHex(n_hex)))

				
				if (next_neighbours.length != 0) prev_tile = random_choice(next_neighbours).tile
				
				console.log("== Got Stuck ==")
				console.log(next_neighbours)
				console.log(prev_tile)

			} else {
				visit_hex_id = genHexId_tfieldHex(random_choice(neighbours))
			}
			
			
		}

	}

	function gen_completely_random(hexes) {
		Object.keys(hexes).forEach( (hex_id, i) => {

			if (hexes[hex_id].tile != null) return;

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

	<div id="terrain-categories">
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

	<div id="tile-list">
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

	<div id="buttons">
		<div id="left-side">
			<div id="preset">
				Preset
					<select bind:value={selector_ruleset} on:change={selector_ruleset_change}>
					<option value={one_e_dmg_ruleset}>AD&D 1e DMG</option>
					<option value={icy}>Icy Landscape</option>
					<option value={jungle}>Jungle</option>
					<option value={null}>Custom</option>
				</select>
			</div>
			<div id="preset-buttons">
				<button class="outline-button" on:click={clear_ruleset}>Clear</button>
				<button class="outline-button" on:click={() => { exportGenFunction() }}>Export</button>
				<button class="outline-button" id="import-button"><input type="file" bind:files={importFiles} on:change={() => { importGenFunction() }} />Import</button>
			</div>
		</div>
		<div id="right-side">
			<div id="generate-buttons">
				<span><Checkbox bind:checked={gen_config_animate} /> Animate </span>
				<span style="margin-left: 0.25em;"><Checkbox bind:checked={gen_config_clear} /> Clear Before Generation</span>
			</div>
			<div id="generate">
				<button class="evil" on:click={() => { showTerrainGenerator = false }}>Close</button>
				<button id="generate-button" class="green-button" on:click={() => { generate() }}>Generate!</button>
			</div>
		</div>
	</div>
</main>

<style>
	main {
		width: 38em;
		height: 80%;
		position: absolute;
		top: 1em;
		right: 1em;

		display: grid;
		gap: 0.4em;
		grid-template-columns: 1fr 11em;
		grid-template-rows: 1fr auto;
		box-sizing: border-box;
		background-color: var(--primary-background);
	}

	#terrain-categories {
		display: flex;
		flex-direction: column;
		gap: 0.25em;
		margin: 1em 0 0 1em;
		background-color: var(--primary-background);
		border-radius: var(--small-radius);
		overflow-y: scroll;
	}

	#tile-list {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		grid-auto-rows: auto;
		gap: 0.25em;
		padding: 0.25em;
		margin: 1em 1em 0 0;
		background-color: var(--light-background);
		border-radius: var(--small-radius);
		overflow-y: scroll;
	}

	#tile-list button {
		aspect-ratio: 1/1;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#tile-list button img {
		width: 90%;
	}

	/* Big Rows */
	.terrain-category {
		display: flex;
		background-color: var(--light-background);
		border-radius: var(--small-radius);
	}

	.terrain-category button {
		background-color: var(--lighter-background);
	}

	.terrain-category button:hover {
		background-color: var(--lightest-background);
	}

	.terrain-category button.selected {
		background-color: var(--dark-primary);
		outline: none;
		box-sizing: content-box;
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

	/* Added Tile in the cost */
	.added-ids .added-tile {
		position: relative;
		width: 3em;
		height: 3em;
		
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.added-tile:hover {
		outline: var(--secondary) solid 0.15em;
		outline-offset: -0.15em;
		border-radius: var(--small-radius);
	}

	.added-tile:active {
		outline: var(--secondary) solid 0.25em;
		outline-offset: -0.25em;
	}
	
	.added-tile p {
		position: absolute;
		right: 0;
		bottom: 0;
		height: 40%;
		width: 40%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--primary-background);
		border-radius: 50%;
		padding: 0;
		margin: 0;
		opacity: 0.8;
		user-select: none;
		font-size: 90%;
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

	#buttons {
		grid-column: 1/3;
		background-color: var(--light-background);
		padding: 0.625em;

		display: flex;
		justify-content: space-between;
		gap: 0.5em;
	}

	#left-side {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	#preset {
		display: flex;
		gap: 0.5em;
	}

	#preset-buttons {
		display: flex;
		gap: 0.5em;
	}

	#right-side {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
	}

	#generate-buttons {
		display: flex;
		gap: 0.5em;
		justify-content: space-between;
	}

	#generate-buttons span {
		display: flex;
		gap: 0.25em;
	}

	#generate {
		display: flex;
		gap: 0.5em;
		justify-content: flex-end;
	}

</style>
