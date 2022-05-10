<script lang="ts">
    import ColorInput from "../../components/ColorInput.svelte";
    import SelectGrid from "../../components/SelectGrid.svelte";
    import CustomValueToggle from "../../components/CustomValueToggle.svelte";
    import type { text_style } from "src/types/text";
    import type { text_data } from "src/types/data";

    export let data_text: text_data;
    export let comp_textLayer;

    /* This is fucking barbaric... but I can't find a way to make to make it work */
    function focus(node) {
        setTimeout(() => {node.focus()}, 10)
    }

    
    let textStyles = [
        {display: "Big", style: {fontFamily: "Segoe UI", fill: "#000000", fontSize: 40, miterLimit: 2, strokeThickness: 5, stroke: "#f2f2f2", align: "center", fontStyle: "normal", fontWeight: "normal"} },
        {display: "Big Sans", style: {fontFamily: "Comic Sans MS", fill: "#000000", fontSize: 40, miterLimit: 2, strokeThickness: 5, stroke: "#f2f2f2", align: "center", fontStyle: "normal", fontWeight: "normal"} },
        {display: "Little", style: {fontFamily: "Segoe UI", fill: "#000000", fontSize: 25, miterLimit: 2, strokeThickness: 0, stroke: "#f2f2f2", align: "left", fontStyle: "normal", fontWeight: "normal"} },
    ]

    function selectedMatches(style: text_style): boolean {

        return JSON.stringify(style) == JSON.stringify(data_text.style)

    }

    $: {
        data_text.selectedText = data_text.selectedText /* If this line isn't here the textstyles dont update and the selected button gets stuck. Svelte weirdness?  */
        textStyles = textStyles
    }

    function changeTextStyle(style: text_style) {
        data_text.style = {...style};
        //data_text = data_text
        textStyles = textStyles /* Updates the selected button */
    }

</script>

<div class="panel">

    <div id="controls">
        <ColorInput bind:value={data_text.style.fill} name="textFill" label={"Color"} />
        <input type="number" bind:value={data_text.style.fontSize} >

        <ColorInput bind:value={data_text.style.stroke} name="textStroke" label={"Stroke"} />
        <input type="number" bind:value={data_text.style.strokeThickness} >

        <select bind:value={data_text.style.fontFamily} >
            <option value={"Segoe UI"}>Segoe UI</option>
            <option value={"Comic Sans MS"}>Comic Sans</option>
            <option value={"Arial"}>Arial</option>
            <option value={"Times New Roman"}>Times New Roman</option>
        </select>

        <SelectGrid values={["left", "center", "right"]} bind:value={data_text.style.align} filenamePrefix={"textalign"} />

        <div id="font-style-container">
            <div id="font-style-options">

                <div class="font-style-option">
                    <CustomValueToggle offValue={"normal"} onValue={"italic"} bind:value={data_text.style.fontStyle}><i style="font-family: Times New Roman">I</i></CustomValueToggle>
                </div>

                <div class="font-style-option">
                    <CustomValueToggle offValue={"normal"} onValue={"bold"} bind:value={data_text.style.fontWeight}><b>B</b></CustomValueToggle>
                </div>

            </div>
        </div>


    </div>

    {#if data_text.selectedText}
        <div id="selected-text-controls">
            <button on:click={() => {comp_textLayer.deleteText(data_text.selectedText)} } > Delete Text </button>
        
            <textarea bind:value={data_text.selectedText.text} use:focus bind:this={data_text.editorRef}/> <!-- The editor ref is literally jsut used to let us focus the text area by clicking on the text. -->
        </div>
    {/if}

    <div id="text-styles" style={data_text.selectedText ? "padding-top: 10px" : ""}>
        <p>Text Styles</p>
        {#each textStyles as ts}
            <button on:click={() => {  changeTextStyle( ts.style ) }} class:selected={ selectedMatches(ts.style) } >{ts.display}</button>
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

    .selected {
        outline: #8cc63f solid 1px;
        border-color: #8cc63f;
    }

    #selected-text-controls {
        padding: 10px;
        background-color: #555555;
    }

    #text-styles {
        padding: 10px;
        background-color: #555555;
    }

    #text-styles p {
        margin: 0;
        margin-bottom: 5px;
    }

    #font-style-options {
        display: flex;
        gap: 1px;
        background-color: #555555;
        border: solid 1px #555555;
        border-radius: 3px;

    }

    .font-style-option {
        width: 30px;
        height: 30px;
    }

    #font-style-container {
        display: inline-block;
        border-radius: 3px;
    }

</style>