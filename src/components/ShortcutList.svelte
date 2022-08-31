<script lang="ts">
	/* I am sure there's a data strcuture out there that will make this more efficient, but it works for now */
	import { shortcuts } from '../lib/keyboardShortcuts';
	import { tools } from '../types/toolData';

	const GENERALHEADING: string = 'General Keybinds';

	let toolHeadings = [
		{ tool: null, heading: GENERALHEADING },
		{ tool: tools.TERRAIN, heading: 'Terrain Tool' },
		{ tool: tools.ICON, heading: 'Icon Tool' },
		{ tool: tools.PATH, heading: 'Path Tool' },
		{ tool: tools.TEXT, heading: 'Text Tool' },
		{ tool: tools.ERASER, heading: 'Eraser Tool' },
	];

	let keysDown: string[] = [];

	function isKeyDown(key: string, ke: string[]): boolean {
		let t = ke.find((k) => k == key) != null;
		return t;
	}

	export function keydown(e: KeyboardEvent) {
		keysDown = [...keysDown, e.key.toLowerCase()];
	}

	export function keyup(e: KeyboardEvent) {
		keysDown = keysDown.filter((k) => k != e.key.toLowerCase());
	}

	function splitKeycode(keycode: string) {
		return keycode.split('+');
	}
</script>

<div id="maps-container">
	<div id="maps">
		{#each toolHeadings as toolHeading}
			<h2 style={toolHeading.heading == GENERALHEADING ? 'margin-top: 0px;' : ''}>{toolHeading.heading}</h2>

			{#each shortcuts.filter((s) => s.tool == toolHeading.tool) as shortcut}
				<span class="shortcut-listing">
					<p>{shortcut.display}</p>
					<p class="keycode">
						{#if shortcut.displayKeycode}
							<div class:highlighted={isKeyDown(shortcut.keycode, keysDown)}>{shortcut.displayKeycode}</div>
						{:else}
							{#each splitKeycode(shortcut.keycode) as keyCodePart}
								{#if keyCodePart == 'control'}
									<div class:highlighted={isKeyDown(keyCodePart, keysDown)}>{keyCodePart}+</div>
								{:else if keyCodePart == 'shift'}
									<div class:highlighted={isKeyDown(keyCodePart, keysDown)}>{keyCodePart}+</div>
								{:else if keyCodePart == 'alt'}
									<div class:highlighted={isKeyDown(keyCodePart, keysDown)}>{keyCodePart}+</div>
								{:else}
									<div class:highlighted={isKeyDown(keyCodePart, keysDown)}>{keyCodePart}</div>
								{/if}
							{/each}
						{/if}
					</p>
				</span>
			{/each}
		{/each}
	</div>
</div>

<style>
	.highlighted {
		color: #8cc63f;
	}

	.shortcut-listing {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;

		margin-bottom: 5px;

		padding-top: 1px;
		padding-bottom: 1px;
		padding-left: 5px;
	}

	.shortcut-listing:hover {
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: 4px;
	}

	.keycode {
		font-family: monospace;
		background-color: #222222;
		color: #f2f2f2;
		padding-left: 5px;
		border-radius: 4px;
		display: flex;
	}

	h2 {
		margin-bottom: 5px;
	}

	p {
		margin: 0;
	}

	#maps-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(4px);
	}

	#maps {
		width: 50%;
		height: 75%;
		background: #333333;
		border: solid 1px grey;
		border-radius: 3px;

		position: relative;

		padding: 10px;
		box-sizing: border-box;

		overflow-y: scroll;
	}
</style>
