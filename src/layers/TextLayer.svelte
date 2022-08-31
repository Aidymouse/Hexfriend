<script lang="ts">
	import * as store_panning from '../stores/panning';
	import type { text_data } from '../types/data';
	import type { shortcut_data } from '../types/inputs';
	import type { pan_state } from '../types/panning';
	import type { text_layer_text } from '../types/text';
	import * as PIXI from 'pixi.js';
	import { Graphics, Text } from 'svelte-pixi';

	let pan: pan_state;
	store_panning.store.subscribe((newPan) => {
		pan = newPan;
	});

	export let data_text: text_data;
	let hoveredText;

	let dragText;
	let dragX; // offset from the
	let dragY;

	export let texts: text_layer_text[] = [
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
		data_text.contextStyleId = null;

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
		dragX = store_panning.curWorldX() - hoveredText.x;
		dragY = store_panning.curWorldY() - hoveredText.y;
	}

	export function pointerup() {
		dragText = null;
	}

	export function pointermove() {
		if (!data_text.usingTextTool) return;

		if (dragText) {
			dragText.x = store_panning.curWorldX() - dragX;
			dragText.y = store_panning.curWorldY() - dragY;
			texts = texts;
		}
	}

	function newText() {
		texts.push({ id: textId, text: '', style: { ...data_text.style }, x: store_panning.curWorldX(), y: store_panning.curWorldY() });
		textId++;
		texts = texts;
		data_text.selectedText = texts[texts.length - 1];
	}

	export function deleteText(text: text_layer_text) {
		if (text == data_text.selectedText) data_text.selectedText = null;
		let i = texts.indexOf(text);
		texts.splice(i, 1);
		texts = texts;
	}

	/* Hacky as fuck, but updating the text size alone doesnt do it... */
	function getTextWidth(text: text_layer_text): number {
		let tm = PIXI.TextMetrics.measureText(text.text, new PIXI.TextStyle(text.style));
		return tm.width;
	}

	function getTextHeight(text: text_layer_text): number {
		let tm = PIXI.TextMetrics.measureText(text.text, new PIXI.TextStyle(text.style));
		return tm.height;
	}

	let alignMap = {
		left: { x: 0, y: 0 },
		center: { x: 0.5, y: 0 },
		right: { x: 1, y: 0 },
	};

	export function moveAllTexts(xMod: number, yMod: number) {
		texts.forEach((t) => {
			t.x += xMod;
			t.y += yMod;
		});

		texts = texts;
	}

	export function handleKeyboardShortcut(shortcutData: shortcut_data) {
		switch (shortcutData.function) {
			case 'toggleItalics':
				data_text.style.fontStyle = data_text.style.fontStyle == 'italic' ? 'normal' : 'italic';
				break;

			case 'toggleBold':
				data_text.style.fontWeight = data_text.style.fontWeight == 'bold' ? 'normal' : 'bold';
				break;

			case 'deleteText':
				if (data_text.selectedText) deleteText(data_text.selectedText);
				break;
		}
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
