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

</script>



<div style="--bg-color: {stringValue}">

    <input type="color" bind:value={stringValue}>

</div>




<style>

    div {
        border-radius: 50%;
        overflow: none;
        border: solid 2px white;
        box-sizing: border-box;
        background-color: var(--bg-color);

        width: 100%;
        height: 100%;

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