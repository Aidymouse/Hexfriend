<script lang="ts">
    import { createEventDispatcher } from 'svelte'

    let dispatch = createEventDispatcher()
    
    export let value: string = "#000000";

    export let width: number = 25;
    export let height: number = 25;
    
    export let label: string = null;
    export let name: string = null;

    $: {
        value = value;
        dispatch("change", {})
    }

</script>

<main>

    <div style="--bg-color: {value}; width: {width}px; height: {height}px;">

        <input type="color" id={name} bind:value={value}>

    </div>

    {#if label}
        <label for={name}> {label} </label>
    {/if}
</main>


<style>

    main {
        display: flex;
        color: white;
        align-items: center;
    }


    div {
        border-radius: 50%;
        overflow: none;
        border: solid 2px white;
        box-sizing: border-box;
        background-color: var(--bg-color);

        margin-right: 5px;

    }

    div:hover {
        border-color: #222222;
    }

    input {
        width: 100%;
        height: 100%;
        opacity: 0;
    }

</style>