<script lang="ts">
    import * as PIXI from 'pixi.js'

    export let value: number = 0x000000

    let oldStringValue = PIXI.utils.hex2string(value)
    let stringValue = oldStringValue

    $: {
        if (stringValue != oldStringValue) {
            /* If the old and new values dont match, then the value was changed on the input, not externally */
            value = PIXI.utils.string2hex(stringValue)
        } else {
            stringValue = PIXI.utils.hex2string(value)
        }
        oldStringValue = stringValue
    }

    export let width: number = 25
    export let height: number = 25
    
    export let label = ""


</script>

<main>

    <div style="--bg-color: {stringValue}; width: {width}px; height: {height}px;">

        <input type="color" bind:value={stringValue}>

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