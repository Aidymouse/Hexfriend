<script lang="ts">

    import { Application } from 'svelte-pixi';
    import * as PIXI from 'pixi.js';

    let app = new PIXI.Application({
        width: 400,
        height: 400
    })

</script>

<Application bind:instance={app}>
    <slot></slot>
</Application>