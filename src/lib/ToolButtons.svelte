<script lang="ts">

    let buttons = [
        {display: "Terrain", toolCode: "terrain"},
        {display: "Icon", toolCode: "icon"},
        {display: "Path", toolCode: "path"},
        {display: "Text", toolCode: "text"},
        {display: "Eraser", toolCode: "eraser"},
    ]

    export let selectedTool: string;

</script>

<main>

    {#each buttons as b}
        <button class={ selectedTool == b.toolCode ? "selected" : ""} on:click={e => { selectedTool = b.toolCode } } title={`${b.display} Tool`}>
            <img src={`/assets/img/tools/${b.toolCode}.png`} alt={`${b.toolCode} Tool`}>
        </button>
    {/each}

</main>

<style>
    main {
        display: grid;
        grid-template-columns: 50px;
        grid-template-rows: 50px;
        grid-auto-rows: 50px;
        gap: 10px;
    }

    main button {
        width: 50px;
        height: 50px;
    }

    button {
        display: flex;
        align-items: center;
        justify-content: center;
        transition-duration: .2s;
    }

    .selected {
        border-color: #8cc63f;
        outline: #8cc63f solid 1px;
        transition-duration: .2s;
    }
</style>