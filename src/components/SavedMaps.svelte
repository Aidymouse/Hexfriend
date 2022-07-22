<script lang="ts">
	import { db } from './db';
	import type { saveData } from './defaultSaveData';
	import { liveQuery } from 'dexie';

	let saves = liveQuery(() => db.mapSaves.toArray());

	export let showSavedMaps: boolean;
	export let load: Function;

	export let createNewMap: Function;

	async function clickedMap(id: number) {
		let mapString = (await db.mapStrings.get(id)).mapString;

		let mapData = JSON.parse(mapString);
		load(mapData, id);
		showSavedMaps = false;
	}

	function deleteMap(id: number) {
		db.mapSaves.delete(id);
		db.mapStrings.delete(id);
	}
</script>

<div id="maps-container">
	<div id="maps">
		<div
			class="map-save"
			id="new-map-button"
			on:click={() => {
				createNewMap();
			}}
		>
			+
		</div>

		{#each $saves || [] as save (save.id)}
			<div class="map-save">
				<div
					on:click={() => {
						clickedMap(save.id);
					}}
				>
					<div class="image-container">
						<img src={save.previewBase64} alt={'Map Preview'} />
					</div>

					<p>{save.mapTitle}</p>
				</div>
				<button
					class="delete-button"
					on:click={() => {
						deleteMap(save.id);
					}}
				>
					<img src="/assets/img/tools/trash.png" />
				</button>
			</div>
		{/each}

		<button
			id="close-button"
			on:click={() => {
				showSavedMaps = false;
			}}
		>
			<img src="/assets/img/tools/close.png" />
		</button>
	</div>
</div>

<style>
	p {
		position: absolute;
		bottom: 0px;
		text-align: center;
		margin: 0;
		padding: 5px;
		background-color: rgba(51, 51, 51, 0.5);
		width: 100%;
		box-sizing: border-box;
	}

	div {
		width: 100%;
		height: 100%;
	}

	#new-map-button {
		border: solid 1px grey;
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		align-items: center;

		font-size: 48pt;
		margin: 0;
		padding: 0;
	}

	#close-button {
		position: absolute;
		right: 5px;
		top: 5px;

		width: 30px;
		height: 30px;

		display: flex;
		align-items: center;
		justify-content: center;

		padding: 0px;
	}

	#close-button img {
		width: 70%;
		height: auto;
	}

	#maps-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(4px);
	}

	#maps {
		width: 50%;
		height: 75%;
		background: #333333;
		border: solid 1px grey;
		border-radius: 3px;

		position: relative;

		padding: 10px;
		box-sizing: border-box;

		display: grid;
		grid-template-columns: 1fr 1fr 1fr 1fr;
		grid-template-rows: 150px;
		grid-auto-rows: 150px;
		gap: 10px;

		overflow-y: scroll;
		overflow-x: hidden;
	}

	.map-save {
		position: relative;
		overflow: hidden;
		border-radius: 3px;
		border: solid 1px transparent;
		cursor: pointer;
		transition-duration: 0.2s;
	}

	.delete-button {
		position: absolute;
		top: 10px;
		right: 10px;
		display: none;

		width: 30px;
		height: 30px;
		padding: 0px;

		justify-content: center;
		align-items: center;

		transition-duration: 0.2s;
	}

	.delete-button img {
		width: 70%;
	}

	.map-save:hover .delete-button {
		display: flex;
	}

	.map-save:hover {
		background-color: #555555;
		border: solid 1px #8cc63f;
		outline: #8cc63f solid 1px;
		transition-duration: 0.2s;
	}

	.image-container {
		width: 100%;
		height: 100%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #000000;
	}

	.image-container img {
		width: 150%;
	}
</style>
