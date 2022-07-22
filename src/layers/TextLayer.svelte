<script lang="ts">
	import * as PIXI from 'pixi.js';
	import type { text_data } from '/src/types/data';
	import { Graphics, Text } from 'svelte-pixi';

	export let pan;

	export let data_text: text_data;
	let hoveredText;

	let dragText;
	let dragX; // offset from the
	let dragY;

	export let texts = [
		// {text: string, style: object }
	];

	let textId = 0;
	texts.forEach((t) => (textId = Math.max(textId, t.id)));
	textId++;

	$: {
		if (data_text.selectedText) data_text.selectedText.style = { ...data_text.style };
		texts = texts;
	}

	export function pointerdown() {
		if (data_text.selectedText && hoveredText) {
			selectText();
			setTimeout(() => {
				data_text.editorRef.focus();
			}, 10); /* I wish I didn't have to do this, and I'm sure it's terrible, but it doesnt work without it :/ */
		} else if (data_text.selectedText) {
			if (data_text.selectedText.text == '') deleteText(data_text.selectedText);
			data_text.selectedText = null;
		} else if (hoveredText) {
			selectText();
		} else {
			newText();
		}
	}

	function selectText() {
		data_text.style = { ...hoveredText.style };
		data_text.selectedText = hoveredText;
		dragText = data_text.selectedText;
		dragX = pan.worldX - hoveredText.x;
		dragY = pan.worldY - hoveredText.y;
	}

	export function pointerup() {
		dragText = null;
	}

	export function pointermove() {
		if (!data_text.usingTextTool) return;

		if (dragText) {
			dragText.x = pan.worldX - dragX;
			dragText.y = pan.worldY - dragY;
			texts = texts;
		}
	}

	function newText() {
		texts.push({ id: textId, text: '', style: { ...data_text.style }, x: pan.worldX, y: pan.worldY });
		textId++;
		texts = texts;
		data_text.selectedText = texts[texts.length - 1];
	}

	export function deleteText(text) {
		if (text == data_text.selectedText) data_text.selectedText = null;
		let i = texts.indexOf(text);
		texts.splice(i, 1);
		texts = texts;
	}

	/* Hacky as fuck, but updating the text size alone doesnt do it... */
	function getTextWidth(text): number {
		let tm = PIXI.TextMetrics.measureText(text.text, new PIXI.TextStyle(text.style));
		return tm.width;
	}

	function getTextHeight(text): number {
		let tm = PIXI.TextMetrics.measureText(text.text, new PIXI.TextStyle(text.style));
		return tm.height;
	}

	let alignMap = {
		left: { x: 0, y: 0 },
		center: { x: 0.5, y: 0 },
		right: { x: 1, y: 0 },
	};

	export function moveAllTexts(xMod, yMod) {
		texts.forEach((t) => {
			t.x += xMod;
			t.y += yMod;
		});

		texts = texts;
	}
</script>

{#each texts as t (t.id)}
	<Text
		x={t.x}
		y={t.y}
		style={t.style}
		text={t.text}
		height={getTextHeight(t)}
		width={getTextWidth(t)}
		interactive={true}
		on:pointerover={(e) => (hoveredText = t)}
		on:pointerout={(e) => (hoveredText = null)}
		anchor={alignMap[t.style.align]}
	/>
{/each}

<Graphics
	draw={(g) => {
		g.clear();
		if (!data_text.usingTextTool) return;

		if (data_text.selectedText) {
			let tW = getTextWidth(data_text.selectedText);
			let tH = getTextHeight(data_text.selectedText);

			g.lineStyle(4, 0x333333);
			g.drawRect(
				data_text.selectedText.x - tW * alignMap[data_text.selectedText.style.align].x - 5,
				data_text.selectedText.y - 5,
				tW + 10,
				tH + 10
			);
		}

		if (hoveredText && hoveredText != data_text.selectedText) {
			let tW = getTextWidth(hoveredText);
			let tH = getTextHeight(hoveredText);

			g.lineStyle(2, 0x555555);
			g.drawRect(hoveredText.x - tW * alignMap[hoveredText.style.align].x - 4, hoveredText.y - 4, tW + 8, tH + 8);
		}
	}}
/>
