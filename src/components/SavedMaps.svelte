<script lang="ts">
	import { db } from '../lib/db';
	import { download } from '../lib/download2';
	import { convertSaveDataToLatest } from '../lib/saveDataConverter';
	import { LATESTSAVEDATAVERSION } from '../types/savedata';
	import { liveQuery } from 'dexie';

	let saves = liveQuery(() => db.mapSaves.toArray());

	export let showSavedMaps: boolean;
	export let load: Function;

	export let createNewMap: Function;

	async function clickedMap(id: number) {
		showSavedMaps = false;

		let mapString = (await db.mapStrings.get(id)).mapString;

		let mapData = JSON.parse(mapString);
		if ((await db.mapSaves.get(id)).saveVersion != LATESTSAVEDATAVERSION) {
			mapData = convertSaveDataToLatest(mapData);
		}

		load(mapData, id);
	}

	function deleteMap(id: number) {
		if (!confirm('Are you sure you want to delete?')) return;

		db.mapSaves.delete(id);
		db.mapStrings.delete(id);
	}

	async function exportAsHexfriend(id: number) {
		let mapData = JSON.parse((await db.mapStrings.get(id)).mapString);

		download(JSON.stringify(mapData), `${mapData.title ? mapData.title : 'Untitled Hexfriend'}.hexfriend`, 'appliation/json');
	}
</script>

<main class:shown={showSavedMaps}>
	<button
		id="close-button"
		on:click={() => {
			showSavedMaps = false;
		}}
	>
		<img src="/assets/img/ui/back.png" alt={'Close Maps'} />
	</button>

	<div id="maps-container" class="shown">
		<h1 class="title">Saved Maps</h1>
		<div
			id="save-map-button"
			on:click={() => {
				createNewMap();
					showSavedMaps = false;
			}}
		>
			<img src="/assets/img/ui/new.svg" alt={'New Map'} />
			<span>New map</span>
		</div>
		<div id="maps">
			{#if $saves}
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
							<div class="error-notification" title={'This save data is on an old version. It may fail to load.'}>!</div>
						{/if}

						<button
							class="delete-button"
							on:click={() => {
								deleteMap(save.id);
							}}
						>
							<img src="/assets/img/tools/trash.png" alt={'Delete Map'} />
						</button>

						<button
							class="delete-button"
							style="margin-right: 35px;"
							on:click={() => {
								exportAsHexfriend(save.id);
							}}
							title={'Quick Export'}
						>
							<img src="/assets/img/ui/quick export.png" alt={'Export'} />
						</button>
					</div>
				{/each}
			{:else}
				<p id="loading-text">Loading...</p>
			{/if}
		</div>
	</div>
</main>

<style>
	main {
		position: absolute;
		top: 0;
		left: -22em;
		width: 19em;
		height: 100%;
		transition-duration: 0.2s;
	}

	main.shown {
		left: 0em;
		transition-duration: 0.2s;
	}

	#maps-container {
		top: 0;
		width: 100%;
		padding: 1em;
		max-height: 100%;
		background-color: var(--hexfriend-green-background);
		display: flex;
		gap: 1em;
		flex-direction: column;
		box-sizing: border-box;
		overflow-y: scroll;
	}

	#maps-container.shown {
		left: 0em;
	}

	.title {
		margin: 0;
	}

	#save-map-button {
		box-sizing: border-box;
		display: flex;
		width: 100%;
		height: 3em;
		justify-content: center;
		align-items: center;
		border-radius: var(--small-radius);

		margin: 0;
		padding: 0;
		transition-duration: 0.1s;
		border: solid 1px var(--lighter-background);

		cursor: pointer;
		padding: 0.25em;
	}

	#save-map-button:hover {
		transition-duration: 0.1s;
		transition-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1);
		background-color: var(--light-background);
	}

	#save-map-button:active {
		background-color: var(--lighter-background);
	}

	#save-map-button img {
		height: 100%;
	}

	#save-map-button span {
		opacity: 0.6;
	}

	#maps {
		width: 100%;
		background: var(--hexfriend-green-background);

		position: relative;

		box-sizing: border-box;

		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-auto-rows: auto;
		gap: 0.5em;
		row-gap: 0.5em;
	}

	.map-save {
		position: relative;
		overflow: hidden;
		border-radius: 0.5em;
		cursor: pointer;
		height: 8.25em;
		aspect-ratio: 1/1;
	}

	#loading-text {
		width: 100%;
		height: 100%;
	}

	p {
		position: absolute;
		bottom: 0;
		text-align: center;
		margin: 0;
		padding: 0.3125em;
		background-color: var(--hexfriend-green-background);
		opacity: 0.75;
		width: 100%;
		box-sizing: border-box;
	}

	div {
		width: 100%;
		height: 100%;
	}

	.map-save.error {
		outline: red 1px solid;
	}

	.map-save .error-notification {
		position: absolute;
		top: 0.5em;
		left: 0.5em;
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

	#close-button {
		position: absolute;

		left: -2.5em;
		top: 0;

		width: 2.5em;
		height: 8em;
		border-radius: 0em;
		border-top-right-radius: 0.5em;
		border-bottom-right-radius: 0.5em;
		border: none;
		background: var(--hexfriend-green-background);
		transition-duration: 0.2s;
		transition-timing-function: ease;
		padding: 0.5em;
		box-sizing: border-box;
	}

	#close-button {
		left: 22.75em;
	}

	#close-button img {
		margin: 0;
		width: 100%;
	}

	#close-button:hover {
		background: var(--light-background);
	}

	.delete-button {
		position: absolute;
		top: 0.5em;
		right: 0.5em;
		display: none;

		width: 2em;
		height: 2em;
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
		background-color: var(--light-background);
		outline: solid 0.125em var(--hexfriend-green);
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
