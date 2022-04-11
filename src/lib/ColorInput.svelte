<script lang="ts">
    
    export let value: string = "#000000";

    export let width: number = 25;
    export let height: number = 25;
    
    export let label = "";


</script>

<main>

    <div style="--bg-color: {value}; width: {width}px; height: {height}px;">

        <input type="color" bind:value>

    </div>

    {label}
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