<script lang="ts">
	import { db } from '../lib/db';
	import { liveQuery } from 'dexie';
	import { LATESTSAVEDATAVERSION } from '../types/savedata'
	
	import {convertSaveDataToLatest} from '../lib/saveDataConverter'

	import { download } from '../lib/download2';

	let saves = liveQuery(() => db.mapSaves.toArray());


	export let showSavedMaps: boolean;
	export let load: Function;

	export let createNewMap: Function;

	async function clickedMap(id: number) {
		showSavedMaps = false;
		
		let mapString = (await db.mapStrings.get(id)).mapString;

		let mapData = JSON.parse(mapString);
		if ((await db.mapSaves.get(id)).saveVersion != LATESTSAVEDATAVERSION) {
			mapData = convertSaveDataToLatest(mapData)
		}

		load(mapData, id);
	}

	function deleteMap(id: number) {

		if (!confirm("Are you sure you want to delete?")) return;

		db.mapSaves.delete(id);
		db.mapStrings.delete(id);
	}

	async function exportAsHexfriend(id: number) {

		let mapData = JSON.parse((await db.mapStrings.get(id)).mapString)

		download(JSON.stringify(mapData), `${mapData.title ? mapData.title : 'Untitled Hexfriend'}.hexfriend`, "appliation/json");
				
	}
</script>

<div id="maps-container">
	<div id="maps">
		{#if $saves}
			<div
				class="map-save"
				id="new-map-button"
				on:click={() => {
					createNewMap();
					showSavedMaps = false;
				}}
			>
				+
			</div>

			{#each $saves as save (save.id)}
				<div class="map-save" class:error={save.saveVersion != LATESTSAVEDATAVERSION}>
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

					{#if save.saveVersion != LATESTSAVEDATAVERSION}
					<div class="error-notification" title={"This save data is on an old version. It may fail to load."}>
						!
					</div>
					{/if}

					<button
						class="delete-button"
						on:click={() => {
							deleteMap(save.id);
						}}
					>
						<img src="/assets/img/tools/trash.png" alt={"Delete Map"} />
					</button>

					<button
						class="delete-button"
						style="margin-right: 35px;"
						on:click={() => {
							exportAsHexfriend(save.id);
						}}
						title={"Quick Export"}
					>
						<img src="/assets/img/ui/quick export.png" alt={"Export"} />
					</button>
				</div>
			
			{/each}

		{:else}
				<p>Loading...</p>
		{/if}

		<button
			id="close-button"
			on:click={() => {
				showSavedMaps = false;
			}}
		>
			<img src="/assets/img/tools/close.png" alt={"Close Screen"} />
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

	.map-save.error {
		border: solid 1px red;
	}

	.map-save .error-notification {
		position: absolute;
		top: 10px;
		left: 10px;
		color: red;
		width: 25px;
		height: 25px;
		border: solid 1px red;
		border-radius: 4px;
		background-color: rgba(255, 102, 102, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;

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

	#new-map-button:hover {
		margin-top: -5px;
		margin-left: -5px;
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
	
	.export-button {
	}

	.map-save:hover .delete-button {
		display: flex;
	}

	.map-save:hover {
		background-color: #555555;
		border: solid 1px #8cc63f;
		outline: #8cc63f solid 1px;
		transition-duration: 0.2s;
		margin-left: -5px;
		margin-top: -5px;
		box-shadow: 5px 5px 15px #000000 ;
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
