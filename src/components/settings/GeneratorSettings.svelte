<script lang="ts">

    export let showTerrainGenerator: boolean;
    export let show_icon_generator: boolean;
    export let showSettings: boolean;

</script>

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
    <button
        on:click={() => {
            showTerrainGenerator = true;
            show_icon_generator = false;
            showSettings = false;
        }}
        title={'Terrain Generator'}
        >
        Terrain Generator
    </button>
    
    <button
    on:click={() => {
        show_icon_generator = true;
        showTerrainGenerator = false;
            showSettings = false;
        }}
        title={'Icon Generator'}
    >
        Icon Generator
    </button>
</div>