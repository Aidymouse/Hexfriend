<script lang="ts">

	// TYPES
	import type { text_data } from '../types/data';
	import type { shortcut_data } from '../types/inputs';
	import type { pan_state } from '../types/panning';
	import type { text_layer_text } from '../types/text';

	// STORES
	import * as store_panning from '../stores/panning';
	import { store_has_unsaved_changes } from '../stores/flags';
	
	// LIB
	import * as PIXI from 'pixi.js';
	import { afterUpdate, onMount } from 'svelte';

	//import { Transformer, TransformerHandle } from "@pixi-essentials/transformer"

	/*

	class TextTransformer extends Transformer {
		onPointerDown(e) {
			super.onPointerDown(e)
		}
	}
	*/

	let pan: pan_state;
	store_panning.store.subscribe((newPan) => {
		pan = newPan;
	});

	export let cont_all_text;

	export let data_text: text_data;
	let hoveredText;

	let dragText;
	let dragX; // offset from the
	let dragY;

	export let texts: text_layer_text[] = [
		// {text: string, style: object }
	];

	//let trsfm_text = new TextTransformer();
	//trsfm_text.skewEnabled = false
	//trsfm_text.scaleEnabled = false
	//trsfm_text.translateEnabled = false

	function rotate_handler() {
	}

	function rotate_end() {
	}

	let textId = 0;
	texts.forEach((t) => (textId = Math.max(textId, t.id)));
	textId++;

	$: {
		if (data_text.selectedText) {
			data_text.selectedText.style = { ...data_text.style }
			data_text.selectedText.alpha = data_text.alpha;
		};
		texts = texts;
		hoveredText = hoveredText;
	}

	export function pointerdown() {

		data_text.contextStyleId = null;

		if (data_text.selectedText && hoveredText) {
			selectText();
			setTimeout(() => {
				data_text.editorRef.focus();
			}, 10); /* I wish I didn't have to do this, and I'm sure it's terrible, but it doesnt work without it :/ */
		} else if (data_text.selectedText) {
			deselectText();
		} else if (hoveredText) {
			selectText();
		} else {
			newText();
		}
	}

	function selectText() {
		data_text.style = { ...hoveredText.style };
		data_text.selectedText = hoveredText;
		data_text.alpha = hoveredText.alpha;

		dragText = data_text.selectedText;
		dragX = store_panning.curWorldX() - hoveredText.x;
		dragY = store_panning.curWorldY() - hoveredText.y;

		//trsfm_text.group[0] = (pixi_texts[data_text.selectedText.id])

	}

	function deselectText() {
		if (!data_text.selectedText) return

		if (data_text.selectedText.text == '') deleteText(data_text.selectedText);
		data_text.selectedText = null

		//trsfm_text.group = []
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
			$store_has_unsaved_changes = true;
		}
	}

	function newText() {
		texts.push({ 
			id: textId,
			text: '',
			alpha: data_text.alpha,
			style: { ...data_text.style },
			x: store_panning.curWorldX(),
			y: store_panning.curWorldY(),
			rotation: 0
		});
		textId++;
		texts = texts;
		data_text.selectedText = texts[texts.length - 1];
		$store_has_unsaved_changes = true;
	}


	export function deleteText(text: text_layer_text) {
		if (text == data_text.selectedText) data_text.selectedText = null;
		let i = texts.indexOf(text);
		texts.splice(i, 1);
		texts = texts;
		$store_has_unsaved_changes = true;
	}

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
		$store_has_unsaved_changes = true;
	}

	export function handleKeyboardShortcut(shortcutData: shortcut_data) {
		switch (shortcutData.function) {
			case 'toggleItalics':
				data_text.style.fontStyle = data_text.style.fontStyle == 'italic' ? 'normal' : 'italic';
				$store_has_unsaved_changes = true;
				break;

			case 'toggleBold':
				data_text.style.fontWeight = data_text.style.fontWeight == 'bold' ? 'normal' : 'bold';
				$store_has_unsaved_changes = true;
				break;

			case 'deleteText':
				if (data_text.selectedText) deleteText(data_text.selectedText);
				$store_has_unsaved_changes = true;
				break;
		}
	}

	let pixi_texts = {};
	let cont_pixi_text = new PIXI.Container();
	let grph_selector = new PIXI.Graphics();

	cont_all_text.addChild(cont_pixi_text, grph_selector);

	

	afterUpdate(() => {

		for (const [text_id, pixi_text] of Object.entries(pixi_texts)) {
			pixi_text.marked_for_death = true
		}

		for (const text of texts) {
			if (!pixi_texts[text.id]) {
				let new_text = new PIXI.Text()
				new_text.interactive = true
				new_text.on("pointerover", (e) => { hoveredText = text; } )
				new_text.on("pointerout", (e) => { hoveredText = null} )

				pixi_texts[text.id] = new_text
				cont_pixi_text.addChild(new_text)
			}

			let pixi_text = pixi_texts[text.id]
			pixi_text.x = text.x
			pixi_text.y = text.y
			pixi_text.text = text.text
			pixi_text.style = text.style
			pixi_text.anchor = alignMap[text.style.align]
			pixi_text.marked_for_death = false
			pixi_text.alpha = text.alpha ? text.alpha : 1
			pixi_text.rotation = text.rotation ? text.rotation : 0
		}

		for (const [text_id, pixi_text] of Object.entries(pixi_texts)) {
			if (pixi_text.marked_for_death) {
				cont_pixi_text.removeChild(pixi_text)
				delete pixi_texts[text_id]
			}
		}


		/* Selector */
		grph_selector.clear();
		if (!data_text.usingTextTool) return;

		
		if (data_text.selectedText) {
			let tW = getTextWidth(data_text.selectedText);
			let tH = getTextHeight(data_text.selectedText);

			grph_selector.lineStyle(4, 0x333333);
			grph_selector.drawRect(
				data_text.selectedText.x - tW * alignMap[data_text.selectedText.style.align].x - 5,
				data_text.selectedText.y - 5,
				tW + 10,
				tH + 10
			);

		}

		if (hoveredText && hoveredText != data_text.selectedText) {
			let tW = getTextWidth(hoveredText);
			let tH = getTextHeight(hoveredText);

			grph_selector.lineStyle(2, 0x555555);
			grph_selector.drawRect(hoveredText.x - tW * alignMap[hoveredText.style.align].x - 4, hoveredText.y - 4, tW + 8, tH + 8);
		
		}

	})

	onMount(() => {
		cont_all_text.removeChildren(0)
		//cont_all_text.addChild(trsfm_text)
		cont_pixi_text = new PIXI.Container()
		cont_all_text.addChild(cont_pixi_text)
		cont_all_text.addChild(grph_selector)
	})
</script>

