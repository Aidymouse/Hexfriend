<script lang="ts">
    
    import type { saveData } from './defaultSaveData';

    import {liveQuery} from 'dexie'
    import {db} from './db'

    let saves = liveQuery(
        () => db.mapSaves.toArray()
    )

    export let showSavedMaps: boolean
    export let load: Function

    function clickedMap(mapString: string, id: number) {
        let mapData = JSON.parse(mapString)
        load(mapData, id)
        showSavedMaps = false
    }

    function deleteMap(id: number) {
        db.mapSaves.delete(id);
    }

</script>


<div id="maps-container">
    
    <div id="maps">
        <button on:click={()=>{showSavedMaps = false}}>Close</button>

        {#each $saves || [] as save (save.id)}
            <div id="map-save">
                <div on:click={ () => { clickedMap(save.mapString, save.id) } }>
                    <div id="image-container" >
                        <img src={save.previewBase64} alt={"Map Preview"}>
                    </div>

                    <p>{JSON.parse(save.mapString).title}</p>
                </div>
                <button class="delete-button" on:click={()=>{deleteMap(save.id)}}>Delete</button>
            </div>
        {/each}
        
        
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
        height: 50%;
        background: #333333;
        border: solid 1px grey;
        border-radius: 3px;

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

    #map-save {
        position: relative;
        overflow: hidden;
        border-radius: 3px;
        border: solid 1px transparent;
        cursor: pointer;
    }

    .delete-button {
        position: absolute;
        top: 10px;
        right: 10px;
        display: none;
    }

    #map-save:hover .delete-button {
        display: block;
    }

    #map-save:hover {
        background-color: #555555;
        border: solid 1px grey;
    }

    #image-container {
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #000000;
    }

    img {
        width: 150%;
    }



</style>