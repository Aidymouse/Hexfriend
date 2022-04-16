<script lang="ts">
    import ColorInput from "../ColorInput.svelte";
import SelectGrid from "../../components/SelectGrid.svelte";


    export let data_text;
    export let comp_textLayer;

    /* This is fucking barbaric... but I can't find a way to make to make it work */
    function focus(node) {
        setTimeout(() => {node.focus()}, 10)
    }


    let textStyles = [
        {display: "Big", style: {fontFamily: "Segoe UI", fill: "#000000", fontSize: 40, miterLimit: 2, strokeThickness: 5, stroke: "#f2f2f2"} },
        {display: "Little", style: {fontFamily: "Segoe UI", fill: "#000000", fontSize: 25, miterLimit: 2, strokeThickness: 0, stroke: "#f2f2f2"} },
    ]

</script>

<div class="panel">

    <div id="controls">
    <ColorInput bind:value={data_text.style.fill} label={"Color"} />
    <input type="number" bind:value={data_text.style.fontSize}>

    <ColorInput bind:value={data_text.style.stroke} label={"Stroke"} />
    <input type="number" bind:value={data_text.style.strokeThickness}>

    <select bind:value={data_text.style.fontFamily}>
        <option value={"Segoe UI"}>Segoe UI</option>
        <option value={"Comic Sans MS"}>Comic Sans</option>
        <option value={"Arial"}>Arial</option>
        <option value={"Times New Roman"}>Times New Roman</option>
    </select>

    <SelectGrid values={["left", "center", "right"]} bind:value={data_text.style.align} filenamePrefix={"textalign"} />

    </div>

    {#if data_text.selectedText}
        <div id="selected-text-controls">
            <button on:click={() => {comp_textLayer.deleteText(data_text.selectedText)} } > Delete Text </button>
        
            <textarea bind:value={data_text.selectedText.text} use:focus bind:this={data_text.editorRef} />
        </div>
    {/if}

    <div id="text-styles" style={data_text.selectedText ? "padding-top: 10px" : ""}>
        <p>Text Styles</p>
        {#each textStyles as ts}
            <button on:click={() => {data_text.style = {...ts.style}}}>{ts.display}</button>
        {/each}
    </div>


</div>

<style>
    .panel {
        color: white;
    }

    #controls {
        padding: 10px;
    }

    #selected-text-controls {
        padding: 10px;
        background-color: #555555;
    }

    #text-styles {
        padding: 10px;
        padding-top: 0px;
    }

    #text-styles p {
        margin: 0;
        margin-bottom: 5px;
    }

</style>