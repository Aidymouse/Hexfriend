<script lang="ts">
	import type { hex_id } from '../types/toolData';

	import { genHexId, genHexId_tfieldHex, getNeighbours } from '../helpers/hexHelpers';
	import { download } from '../lib/download2';
	import { rand, pick_from_weighted } from '../helpers/random';
	
	import { store_has_unsaved_changes } from '../stores/flags';
	import { tfield } from '../stores/tfield';

	import type { TerrainHex, terrain_field } from '../types/terrain';
	import type { Tile, Tileset, tile_id } from '../types/tilesets';
	import type { coords_cubeToWorld } from '../helpers/hexHelpers';
	import type { Iconset, Icon } from '../types/icon';
	import Checkbox from './Checkbox.svelte';


	export let loadedIconsets: Iconset[];

	
	export let comp_iconLayer;
	export let show_icon_generator: boolean;

	let importFiles: FileList;

	let gen_config_center = true;
	let gen_config_animate = false;

	interface rule {
		item: Icon
		weight: number
	}

	type icon_generation_ruleset = {
		chance_for_icon: number
		chance_for_icon_high: number
		icon_chances: rule[]
	}

	let current_ruleset: icon_generation_ruleset = {
		chance_for_icon: 1,
		chance_for_icon_high: 6,
		icon_chances: []
	}

	let random_chances = []
	// Populate random
	// This does mean that if you load an iconset while the window is open the random generator won't update
	// I dont like that but it probably doesn't matter.
	loadedIconsets.forEach((iconset: Iconset) => {
		iconset.icons.forEach((icon: Icon) => {
			random_chances.push( {item: icon, weight: 1} );
		});
	});	

	// Wrapper for generation methods
	function generate() {

		//comp_terrainLayer.renderAllHexes()
		let icons_placed = 0

		Object.keys($tfield.hexes).forEach( (hex_id, i) => {
			let icon_chance = rand(1, current_ruleset.chance_for_icon_high)
			if (icon_chance > current_ruleset.chance_for_icon) return;

			let hex: TerrainHex = $tfield.hexes[hex_id]

			let hex_pos = {q: hex.q, r: hex.r, s: hex.s}

			if (!gen_config_center) {
				let new_q = hex.q + Math.random() - 0.5
				let new_r = hex.r +  Math.random() - 0.5

				hex_pos = {q: new_q, r: new_r, s:-new_q-new_r }
			}

			let rand_icon: Icon;

			if (current_ruleset.icon_chances.length > 0) {
				rand_icon = pick_from_weighted(current_ruleset.icon_chances)
			} else {
				rand_icon = pick_from_weighted(random_chances)
			}

			if (gen_config_animate) {

				setTimeout(() => { comp_iconLayer.place_icon(rand_icon, hex_pos) }, icons_placed*15)
				icons_placed += 1

			} else {
				comp_iconLayer.place_icon(rand_icon, hex_pos)
			}


		})

		$store_has_unsaved_changes = true

	}

	/* Export Import */
	function exportGenFunction() {
		let name = prompt("What would you like to call this ruleset?")
		if (!name) return;

		download(JSON.stringify(current_ruleset), `${name}.hfigrs`, 'hexfriendicongeneratorruleset');
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
	function add_to_ruleset(icon: Icon) {

		let icon_rule = current_ruleset.icon_chances.find(rule => rule.item == icon);

		if (!icon_rule) {
			icon_rule = {item: icon, weight: 0}
			current_ruleset.icon_chances.push(icon_rule)
		}
		icon_rule.weight += 1

		current_ruleset = current_ruleset

	}

	function remove_from_ruleset(icon_chance: rule) {
		icon_chance.weight -= 1

		current_ruleset.icon_chances = current_ruleset.icon_chances.filter(ic => ic.weight > 0)
	}

	function clear_ruleset() {
		if (!confirm("Are you sure?")) return;

		current_ruleset.icon_chances = [];
	}

	$: {
		current_ruleset.chance_for_icon = Math.min(current_ruleset.chance_for_icon, current_ruleset.chance_for_icon_high)
	}
</script>

<main class="panel">

	<div id="icon-bag">
		<div id="icon-bag-grid">
			{#each current_ruleset.icon_chances as icon_chance (icon_chance.item)}
				<div class="icon-chance" on:click={ () => { remove_from_ruleset(icon_chance) } }>
					<img src={icon_chance.item.preview} alt={`${icon_chance.item.display}`}>
					<p>{icon_chance.weight}</p>
				</div>
			{/each}
		</div>
	</div>

	<div id="icon-buttons">
		{#each loadedIconsets as iconset}

			{#each iconset.icons as icon (icon.id)}

				<button on:click={() => { add_to_ruleset(icon) }} title={`Add ${icon.display} to generator`}>
					<img src={icon.preview} alt={`${icon.display}`}>
				</button>

			{/each}

		{/each}
	</div>
	
	<div id="buttons">
		<div id="left-side">
			<div id="chance">
				Generation Chance 
				<input type="number" min={1} max={current_ruleset.chance_for_icon_high} bind:value={current_ruleset.chance_for_icon}> 
				in
				<input type="number" min={1} bind:value={current_ruleset.chance_for_icon_high}>
			</div>
			<div id="clear">
				<button class="outline-button" on:click={clear_ruleset}>Clear</button>
			</div>
		</div>
		
		<div id="right-side">
			<div id="generate-buttons">
				<span><Checkbox bind:checked = {gen_config_animate} id="config-animate" /> <label for="config-animate">Animate</label></span>
				<span style="margin-right: 0.5em"><Checkbox bind:checked = {gen_config_center} id="config-snap" /> <label for="config-snap">Place In Hex Center</label></span>
			</div>
			<div id="generate">
				<button class="evil" on:click={() => { show_icon_generator = false }}>Close</button>
				<button class="green-button" on:click={generate}>Generate!</button>
			</div>
		</div>
	</div>
	
</main>

<style>
	main {
		width: 38em;
		height: 70%;
		position: absolute;
		top: 1em;
		right: 1em;

		display: grid;
		grid-template-columns: 1fr 11em;
		grid-template-rows: 1fr auto;
		gap: 0.4em;
		background-color: var(--primary-background);
	}

	span {
		display: flex;
		gap: 0.25em;
	}

	/* Main Controls */
	#icon-buttons {
		border-radius: var(--small-radius);
		background-color: var(--light-background);
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-auto-rows: auto;
		gap: 0.25em;
		margin: 1em 1em 0 0;
		padding: 0.25em;
		overflow-y: auto;
	}
	
	#icon-buttons button {
		width: 100%;
		aspect-ratio: 1/1;
		
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	#icon-buttons button img {
		width: 90%;
	}
	
	#icon-bag {
		border-radius: var(--small-radius);
		margin: 1em 0 0 1em;
		overflow-y: auto;
		background-color: var(--light-background);
	}

	#icon-bag-grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr); 
		padding: 0.25em;
		box-sizing: border-box;
	}

	/* Individual Chance Items */
	.icon-chance {
		width: 100%;
		aspect-ratio: 1/1;

		position: relative;

		display: flex;
		justify-content: center;
		align-items: center;
	}

	.icon-chance img {
		width: 90%;
	}

	.icon-chance p {
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

	.icon-chance:hover {
		outline: var(--secondary) solid 0.15em;
		outline-offset: -0.15em;
		border-radius: var(--small-radius);
	}

	.icon-chance:active {
		outline: var(--secondary) solid 0.25em;
		outline-offset: -0.25em;
	}
	
	/* Config */
	#buttons {
		grid-column: 1/3;
		background-color: var(--light-background);
		padding: 0.625em;

		display: flex;
		justify-content: space-between;
		gap: 0.5em;
	}

	#chance input {
		width: 3em;
	}

	#left-side {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		justify-content: space-between;
	}

	#right-side {
		display: flex;
		flex-direction: column;
		gap: 0.5em;
		justify-content: space-between;
	}

	#generate-buttons {
		display: flex;
		gap: 0.5em;
		justify-content: flex-end;
	}

	#generate {
		display: flex;
		gap: 0.5em;
		justify-content: flex-end;
	}

</style>
