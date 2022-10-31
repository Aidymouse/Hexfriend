<script lang="ts">
    import type { PageData } from './$types';
    /* --- IMPORTS --- 
    // Import Types
    import type { terrain_data, icon_data, path_data, text_data, coordinates_data, eraser_data } from '$lib/types/data';
	import type { save_data } from '$lib/types/savedata';
	// Enums
    import { tools } from '$lib/types/tool_data';
	import { coord_system } from '$lib/types/coordinates';
	*/
    
    // Import Components

    // Import Lib
    import * as PIXI from 'pixi.js';
    
    // App Start
    export let data: PageData;

    let loaded_save = data.loaded_save
    let loaded_save_id = data.loaded_save_id


</script>

<main>
    <!-- Idk why we need to wait but it breaks if we dont :/ -->
    {#await import('$lib/components/PrimaryRenderApp.svelte')}
        <p>Pizza</p>
    {:then app}
        <svelte:component this={app.default}>

        </svelte:component>

    {/await}
</main>


