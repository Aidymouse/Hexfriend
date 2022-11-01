<script lang="ts">
    import type { PageData } from './$types';
    /* --- IMPORTS --- 
    // Import Types
    import type { save_data } from '$lib/types/savedata';
	// Enums
	import { coord_system } from '$lib/types/coordinates';
	*/
    import { tools } from '$lib/types/tool_data';
    
    // Import Components
    import ToolButtons from '$lib/components/Tool_Buttons.svelte';

    // Import Lib
    import * as PIXI from 'pixi.js';
    import * as DATA from '$lib/script/default_data';

    $: DATA.data_text.usingTextTool = false //selectedTool == tools.TEXT;

    // App Start
    export let data: PageData;
    
    let loaded_save = data.loaded_save
    let loaded_save_id = data.loaded_save_id
    
    let selected_tool: tools = tools.TERRAIN


</script>

<main>
    <!-- Idk why we need to wait but it breaks if we dont :/ -->
    {#await import('$lib/components/Primary_Render_App.svelte')}
        <p>Pizza</p>
    {:then app}
        <svelte:component this={app.default}>

        </svelte:component>

    {/await}
</main>


