<script lang="ts">
    import type { icon_data, terrain_data, path_data, text_data } from "src/types/data";
    import { tools } from "/src/types/toolData";


    export let selectedTool: tools;
    export let data_terrain: terrain_data;

    export let data_icon: icon_data;
    export let data_path: path_data;
    export let data_text: text_data;


    /* Terrain */
    interface terrain_controls {
        leftMouse: string
    }

    let c_terrain: terrain_controls = {
        leftMouse: "Place Terrain"
    }

    function setTooltips_terrain() {
        c_terrain.leftMouse = "Place Terrain"

        if (data_terrain.usingEyedropper) {
            c_terrain.leftMouse = "Eyedrop Hex"
        } else if (data_terrain.usingPaintbucket && data_terrain.usingEraser) {
            c_terrain.leftMouse = "Erase all similar"
        
        } else if (data_terrain.usingPaintbucket) {
            c_terrain.leftMouse = "Fill with Terrain"
            
        } else if (data_terrain.usingEraser) {
            c_terrain.leftMouse = "Erase Hex"
        }
    }


    /* Icon */
    interface icon_controls {
        leftMouse: string
    }

    let c_icon: icon_controls = {
        leftMouse: "Place Icon"
    }

    function setTooltips_icon() {
        c_icon.leftMouse = "Place Icon"

        if (data_icon.usingEraser) {
            c_icon.leftMouse = "Erase Icon"
        }
    }


    /* Path */
    interface path_controls {
        leftMouse: string
    }

    let c_path: path_controls = {
        leftMouse: "Place Icon"
    }

    function setTooltips_path() {
        c_path.leftMouse = "Start New Path"

        if (data_path.selectedPath) {
            c_path.leftMouse = "Place Point"
        }

        
    }



    /* Text */
    interface text_controls {
        leftMouse: string
    }

    let c_text: text_controls = {
        leftMouse: "Place New Text"
    }

    function setTooltips_text() {
        c_text.leftMouse = "Place New Text"

        if (data_text.selectedText) {

        }

        
    }





    $: {
        data_terrain = data_terrain
        data_icon = data_icon
        data_path = data_path
        data_text = data_text
        setTooltips()
    }

    $: {
        setTooltips()
    }

    function setTooltips() {

        switch (selectedTool) {
            case tools.TERRAIN:
                setTooltips_terrain()
                break
                
            case tools.ICON:
                setTooltips_icon()
                break

            case tools.PATH:
                setTooltips_path()
                break
            
            case tools.TEXT:
                setTooltips_text()
                break
        }

    }
    
 
</script>

<span>

    <div class="control"> <p>Right Mouse</p> <p>Pan</p></div>
    <div class="control"> <p>Scroll</p> <p>Zoom</p></div>

    {#if selectedTool == tools.TERRAIN}
        <div class="control"> <p>Left Mouse</p> <p>{c_terrain.leftMouse}</p></div>
        
    {:else if selectedTool == tools.ICON}
        <div class="control"> <p>Left Mouse</p> <p>{c_icon.leftMouse}</p></div>

    {:else if selectedTool == tools.PATH}
        <div class="control"> <p>Left Mouse</p> <p>{c_path.leftMouse}</p></div>
    
    {:else if selectedTool == tools.TEXT}
        <div class="control"> <p>Left Mouse</p> <p>{c_text.leftMouse}</p></div>

    {:else if selectedTool == tools.ERASER}
        <div class="control"> <p>Left Mouse</p> <p>Erase Terrain + Icons</p></div>

    {/if}

</span>

<style>

    p {
        margin: 0;
        font-size: 10pt;
    }

    .control {
        display: grid;
        grid-template-columns: 1fr 1fr;
        width: 100%;
    }

    span {
        
        position: absolute;
        right: 0px;
        bottom: 0px;

        padding: 10px;

        width: 200px;
        display: flex;
        
        align-items: flex-end;
        flex-direction: column;
    }

</style>