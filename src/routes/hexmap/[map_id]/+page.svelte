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

    function change_tool(new_tool: tools) {

        selected_tool = new_tool

    }

</script>

<main>
    <!-- Idk why we need to wait but it breaks if we dont :/ -->
    {#await import('$lib/components/Primary_Render_App.svelte')}
        <p>Pizza</p>
    {:then app}
        <svelte:component this={app.default}>

        </svelte:component>

        <ToolButtons 
            bind:data_terrain={DATA.data_terrain}
            bind:data_icon={DATA.data_icon}
            bind:data_path={DATA.data_path}
            bind:hexOrientation={loaded_save.TerrainField.orientation}
            bind:selectedTool={selected_tool}
            changeTool={change_tool}
        />


    {/await}
</main>


