<script lang="ts">
	import { onMount } from "svelte";

    export let app;

    onMount(() => {
        document.getElementById("wrapper").appendChild(app.view)
    })

</script>


<div id="wrapper"></div>

<style>
    div {
        width: 100%;
        height: 100%;
    }
</style>