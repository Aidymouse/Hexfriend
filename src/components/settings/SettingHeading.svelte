<script lang="ts">
	export let text: string;

	export let toggle: boolean;
</script>

<h2
	class="setting-heading"
	on:click={() => {
		toggle = !toggle;
	}}
	on:keydown={() => {}}
>
	{text}
	<button>
		<img
			alt={`Toggle ${{ text }} Settings`}
			class:rotated={toggle}
			src={"/assets/img/ui/arrow.png"}
		/>
	</button>
</h2>

<style>
	.setting-heading {
		display: flex;
		position: relative;
		margin: 0;
	}

	.setting-heading button {
		width: 3em;
		height: 2.2em;
		position: absolute;
		right: 0px;
		border: none;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: transparent;
	}

	.setting-heading button:hover {
		background-color: var(--lighter-background);
	}

	.setting-heading button img {
		height: 80%;
		transition-duration: 0.2s;
	}

	.setting-heading button img.rotated {
		rotate: 180deg;
		transition-duration: 0.2s;
	}
</style>

