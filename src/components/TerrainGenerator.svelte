<script lang="ts">

	// TYPE
	import type { TerrainHex, terrain_field } from '../types/terrain';
	import type { Tile, Tileset } from '../types/tilesets';
	import type { hex_id } from '../types/toolData';
	
	type hex_key = string
	interface rule {
		key: hex_key
		weight: number
	}
	type generation_ruleset = {[key: hex_key]: rule[]}
	
	// STORE
	import { store_has_unsaved_changes } from '../stores/flags';
	import { tfield } from '../stores/tfield';

	// COMPONENT
	import Checkbox from '../components/Checkbox.svelte';
	
	// HELPER
	import { genHexId, genHexId_tfieldHex, getNeighbours } from '../helpers/hexHelpers';
	import { rand, pick_from_weighted, random_choice } from '../helpers/random';
	import { tile_to_key } from '../helpers/tiles';
	// LIB
	import { download } from '../lib/download2';
	import { one_e_dmg_ruleset } from '../lib/generation_rulesets/one_e_dmg';
	import { icy } from '../lib/generation_rulesets/icy';
	import { jungle } from '../lib/generation_rulesets/jungle';



	
	export let loadedTilesets: Tileset[];
	export let comp_terrainLayer;
	export let showTerrainGenerator: boolean;

	let importFiles: FileList;
	let selected_key = tile_to_key(loadedTilesets[0].tiles[0]);

	let gen_config_animate = false;
	let gen_config_clear = false;


	let current_ruleset: generation_ruleset = {} //JSON.parse(JSON.stringify(one_e_dmg_ruleset));
	let selector_ruleset = null //one_e_dmg_ruleset;
	// Populate the gen function
	
	loadedTilesets.forEach((tileset: Tileset) => {
		tileset.tiles.forEach((tile: Tile) => {
			let key = tile_to_key(tile)
			current_ruleset[key] = [{ key: key, weight: 1 }];
		});
	});
	
	function get_tile_from_key(key: hex_key){
		let key_obj = JSON.parse(key)
		let ts = loadedTilesets.find(ts => ts.id == key_obj.tileset_id)
		let t = ts.tiles.find(t => t.id == key_obj.id)
		return t
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

		$store_has_unsaved_changes = true

		// Get length of empty hexes
		let blank_hexes = Object.keys($tfield.hexes).filter(hex_id => $tfield.hexes[hex_id].tile == null)
		let clear_override = false
		if (blank_hexes.length == 0 && !gen_config_clear) {
			clear_override = confirm("No blank hexes to generate in. Would you like to clear all hexes before generation?")
			if (!clear_override) return
		}

		if (gen_config_clear || clear_override) {
			Object.keys($tfield.hexes).forEach(hex_id => {
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
			gen_completely_random($tfield.hexes)
			return;
		}

		//standardGen($tfield.hexes, current_ruleset)
		gen_old_school_generate($tfield.hexes, current_ruleset);
		//comp_terrainLayer.renderAllHexes()

		$store_has_unsaved_changes = true
	}

	function gen_old_school_generate(hexes, ruleset: generation_ruleset) {
		// Meanders through hexes on random walks

		// Get random hex that actually has a rule
		let valid_rule_ids: hex_key[] = Object.keys(ruleset).filter(tile_key => ruleset[tile_key].length > 0)
		let rand_tile_key = valid_rule_ids[rand(0, valid_rule_ids.length-1)]
		let rand_tile = get_tile_from_key(rand_tile_key)
		
		let prev_tile = rand_tile

		let hexes_to_visit = Object.keys(hexes)
		hexes_to_visit = hexes_to_visit.filter(hex_id => $tfield.hexes[hex_id].tile == null)
		let visited = []
		let visit_hex_id = random_choice(hexes_to_visit) 

		let painted_count = 0
		let latest_length = -1

		// Needs: random walks
		while (hexes_to_visit.length > 0) {
			
			// Find which tile to use
			let rule = ruleset[tile_to_key(prev_tile)]
			if (rule.length == 0) return;
			let selected_key = pick_from_weighted(rule.map( rp => { return {item: rp.key, weight: rp.weight} }))
			let selected_tile = get_tile_from_key(selected_key)
			
			// Paint the hex
			paint_hex(visit_hex_id, selected_tile, painted_count);
			painted_count += 1
			
			// Remove it's ID from the list
			hexes_to_visit = hexes_to_visit.filter(id => id != visit_hex_id)

			if (latest_length == hexes_to_visit.length) return // Fail safe in case loop screws up
			latest_length = hexes_to_visit.length
			
			// Choose random blank neighbour
			let neighbours = comp_terrainLayer.get_existant_neighbours(visit_hex_id)
			neighbours = neighbours.filter(n_hex => hexes_to_visit.find(id => genHexId_$tfieldHex(n_hex) == id)) // Remove hexes that have already been visited
			visited.push(visit_hex_id)
			//if (!gen_config_overwrite) neighbours = neighbours.filter(n_hex => n_hex.tile == null) // Get rid of any hexes that are already filled

			if (hexes_to_visit.length < 1) break;
			
			prev_tile = selected_tile

			if (neighbours.length == 0) {
				visit_hex_id = random_choice(hexes_to_visit)
				// Choose a random filled in and visited neighbour, if any, to be the previous tile
				let next_neighbours = comp_terrainLayer.get_existant_neighbours(visit_hex_id)
				next_neighbours = next_neighbours.filter(n_hex => n_hex.tile != null && visited.find(id => id == genHexId_$tfieldHex(n_hex)))

				
				if (next_neighbours.length != 0) prev_tile = random_choice(next_neighbours).tile
				
				/*
				console.log("== Got Stuck ==")
				console.log(next_neighbours)
				console.log(prev_tile)
				*/

			} else {
				visit_hex_id = genHexId_$tfieldHex(random_choice(neighbours))
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

		let transformed_ruleset = {}

		Object.keys(current_ruleset).forEach(tile_key => {
			if (current_ruleset[tile_key].length > 0) {
				transformed_ruleset[tile_key] = current_ruleset[tile_key]
			}
		})

		download(JSON.stringify(transformed_ruleset), `${name}.hfgrs`, 'hexfriendgeneratorruleset');
	}

	function importGenFunction() {
		if (!importFiles[0]) return;

		let r = new FileReader();
		r.onload = (eb) => {

			let loaded_ruleset = JSON.parse(r.result as string)

			current_ruleset = {}
			loadedTilesets.forEach(ts => {
				ts.tiles.forEach(t => {
					let key = tile_to_key(t)
					
					if (Object.keys(loaded_ruleset).find(k => k == key)) {
						current_ruleset[key] = loaded_ruleset[key]
					} else {
						current_ruleset[tile_to_key(t)] = []						
					}

				})
			});

			selected_key = Object.keys(current_ruleset)[0]
		};

		r.readAsText(importFiles[0]);
	}

	/* Modifying the ruleset */
	function removeTileFromFunction(tile_key: tile_id, key_to_remove: tile_id) {
		selector_ruleset = null
		
		let terrain = current_ruleset[tile_key].find((rule_part) => rule_part.key == key_to_remove);
		terrain.weight -= 1;

		if (terrain.weight < 1) current_ruleset[tile_key].splice(current_ruleset[tile_key].indexOf(terrain), 1);
		
		current_ruleset[tile_key] = current_ruleset[tile_key];
	}

	function addTileToFunction(tile_key: tile_id, key_to_add: tile_id) {
		selector_ruleset = null

		let rule = current_ruleset[tile_key];

		let rule_part = rule.find((rp) => rp.key == key_to_add);
		if (!rule_part) {
			rule_part = { key: key_to_add, weight: 0 }
			rule.push(rule_part);
		}
		rule_part.weight += 1;

		current_ruleset = current_ruleset;
	}

	function selector_ruleset_change() {

		console.log(selector_ruleset)

		loadedTilesets.forEach((tileset: Tileset) => {
			tileset.tiles.forEach((tile: Tile) => {
				let key = tile_to_key(tile)
				
				current_ruleset[key] = [];
				
				if (selector_ruleset != null) {
					let selector_rule = Object.keys(selector_ruleset).find(k => k == key)
					if (selector_rule) {
						current_ruleset[key] = JSON.parse(JSON.stringify(selector_ruleset[selector_rule]))
					} 
				}
			});
		});

		selected_key = Object.keys(current_ruleset)[0]
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

	<div id="terrain-controls">

		<div id="terrain-list-children">
			{#each Object.keys(current_ruleset).filter( rs_key => current_ruleset[rs_key].length > 0 ) as tile_key}
				<div class="terrain-list-children-item">
					<button
						on:click={() => {
							selected_key = tile_key;
						}}
						class:selected={selected_key == tile_key}
					>
						<img src={get_tile_from_key(tile_key).preview} alt={get_tile_from_key(tile_key).display} /></button
					>

					<div class="added-ids">
						{#each current_ruleset[tile_key] as allowedData}
							<div
								class="added-tile"
								on:click={() => {
									removeTileFromFunction(tile_key, allowedData.key);
								}}
							>
								<img src={get_tile_from_key(allowedData.key).preview} alt={allowedData.key} />
								<p class="weight-container">{allowedData.weight}</p>
								<!-- Weight has to absolute but also float in middle, hence the container -->
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<div id="terrain-list-childless">
			{#each Object.keys(current_ruleset).filter( rs_key => current_ruleset[rs_key].length == 0 ) as tile_key}
				<button on:click={() => { selected_key = tile_key; }} class:selected={selected_key == tile_key}>
					<img src={get_tile_from_key(tile_key).preview} alt={tile_key} />
				</button>
			{/each}
		</div>
		
	</div>

	<div id="tile-list">
		{#if selected_key != ''}
			{#each loadedTilesets as tileset}
				{#each tileset.tiles as tile (tile.id)}
					<button
						on:click={() => {
							addTileToFunction(selected_key, tile_to_key(tile));
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

	

	#tile-list {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		grid-auto-rows: auto;
		padding: 0.25em;
		gap: 0.25em;
		margin: 1em 1em 0 0;
		background-color: var(--light-background);
		border-radius: var(--small-radius);
		overflow-y: auto;
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
	.terrain-list-children-item {
		display: flex;
		background-color: var(--light-background);
		border-radius: var(--small-radius);
	}

	.terrain-list-children-item button {
		background-color: var(--lighter-background);
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}

	.terrain-list-children-item button:hover {
		background-color: var(--lightest-background);
	}

	.terrain-list-children-item button.selected {
		background-color: var(--dark-primary);
		outline: none;
		box-sizing: content-box;
	}

	#terrain-controls {
		overflow-y: auto;
		margin: 1em 0 0 1em;

	}

	#terrain-list-children {
		display: flex;
		flex-direction: column;
		gap: 0.25em;
		background-color: var(--primary-background);
		border-radius: var(--small-radius);
	}

	#terrain-list-childless {
		margin-top: 0.25em;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
		width: 100%;
		gap: 0.25em;
	}

	#terrain-list-childless button {
		background-color: var(--lighter-background);
		width: 100%;
		aspect-ratio: 1/1;
	}

	#terrain-list-childless button img {
		width:  90%;
	}
	
	#terrain-list-childless button:hover {
		background-color: var(--lightest-background);
	}

	#terrain-list-childless button.selected {
		background-color: var(--dark-primary);
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
