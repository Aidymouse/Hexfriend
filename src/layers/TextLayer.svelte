<script lang="ts">
  // TYPES
  import type { text_data } from '../types/data'
  import type { shortcut_data } from '../types/inputs'
  import type { pan_state } from '../types/panning'
  import type { TextLayerText, TextStyle } from '../types/text'

  // STORES
  import * as store_panning from '../stores/panning'
  import { store_has_unsaved_changes } from '../stores/flags'
  import { tfield } from '../stores/tfield'
  import { data_text } from '../stores/data'

  // LIB
  import * as PIXI from 'pixi.js'
  import { afterUpdate, onMount } from 'svelte'
  import { cancelProspectiveUndoState, completeUndoState, push_undo_state, startUndoState } from '../lib/undoManager'

  // Helpers
  import { coords_cubeToWorld, coords_worldToCube } from '../helpers/hexHelpers'
  import { store_selected_tool } from '../stores/tools'
  import { Tools } from '../types/toolData'
  import {
    find_new_pos_square_orientation_change,
    find_new_pos_through_resize,
    type HexSizeParams,
  } from '../lib/map_resize'
  import HexesSettings from '../components/settings/HexesSettings.svelte'
  import type { HexOrientation, HexRaised } from '../types/terrain'
  import { ALIGN_MAP, getTextHeight, getTextHoverBox, getTextMetrics, getTextWidth, textsMatch } from '../helpers/textHelpers'

  import TextPanel from '../panels/TextPanel.svelte'
  import { get } from 'svelte/store'
  //import { Transformer, TransformerHandle } from "@pixi-essentials/transformer"

  /*

	class TextTransformer extends Transformer {
		onPointerDown(e) {
			super.onPointerDown(e)
		}
	}
	*/

  let pan: pan_state
  store_panning.store.subscribe((newPan) => {
    pan = newPan
  })

  export let cont_all_text

  let hoveredText: TextLayerText | null
  let just_created_id: number | null = null // Set to the ID of a newly created text when it is placed
  let text_prior_to_changes: TextLayerText | null = null

  let dragText
  let dragX // offset from the
  let dragY

  export let texts: TextLayerText[] = [
    // {text: string, style: object }
  ]

  //let trsfm_text = new TextTransformer();
  //trsfm_text.skewEnabled = false
  //trsfm_text.scaleEnabled = false
  //trsfm_text.translateEnabled = false

  function rotate_handler() {}

  function rotate_end() {}

  let textId = 0
  texts.forEach((t) => (textId = Math.max(textId, t.id)))
  textId++

  $: {
    if ($data_text.selectedText) {
      $data_text.selectedText.style = { ...$data_text.style }
    }
    texts = texts
    hoveredText = hoveredText
  }

  export function retain_text_position_on_hex_resize(old_hex_size: HexSizeParams, new_hex_size: HexSizeParams) {
    texts.forEach((text) => {
      let text_height = getTextHeight(text)
      let text_y = text.y + text_height // Makes anchor point of text the bottom

      const new_text_pos = find_new_pos_through_resize({ x: text.x, y: text_y }, old_hex_size, new_hex_size)

      text.x = new_text_pos.x
      text.y = new_text_pos.y - text_height
    })

    texts = texts
  }

  export function retain_text_position_on_orientation_change(
    old_hex_size: HexSizeParams,
    new_hex_size: HexSizeParams,
    cur_raised: HexRaised,
  ) {
    texts.forEach((text) => {
      let text_height = getTextHeight(text)
      let text_y = text.y + text_height // Makes anchor point of text the bottom

      const new_text_pos = find_new_pos_square_orientation_change(
        { x: text.x, y: text_y },
        old_hex_size,
        new_hex_size,
        cur_raised,
      )

      text.x = new_text_pos.x
      text.y = new_text_pos.y - text_height
    })

    texts = texts
  }

  export function pointerdown() {
    $data_text.contextStyleId = null

    if ($data_text.selectedText && hoveredText) {
      startDraggingHovered()
      setTimeout(() => {
        $data_text.editorRef.focus()
      }, 10) /* I wish I didn't have to do this, and I'm sure it's terrible, but it doesnt work without it :/ */
    } else if ($data_text.selectedText) {
      deselectText()
    } else if (hoveredText) {
      selectText()
    } else {
      newText()
    }
  }

  function selectText() {
    $data_text.style = { ...hoveredText.style }
    $data_text.selectedText = hoveredText

    startUndoState({texts}, `Change Text ${$data_text.selectedText.id}`)

    startDraggingHovered()

    text_prior_to_changes = structuredClone(hoveredText)

    //trsfm_text.group[0] = (pixi_texts[$data_text.selectedText.id])
  }

  function startDraggingHovered() {
    dragText = $data_text.selectedText
    dragX = store_panning.curWorldX() - hoveredText.x
    dragY = store_panning.curWorldY() - hoveredText.y
  }

  

  function deselectText() {
    if (!$data_text.selectedText) return

    if ($data_text.selectedText.text == '') { 
      if (just_created_id !== null) {
	cancelProspectiveUndoState()
      }
      deleteText($data_text.selectedText)
      return // okay to return as delete will also deselect
    }


    if (just_created_id === $data_text.selectedText.id) {
      just_created_id = null
      completeUndoState({texts})
    } else if (!textsMatch(text_prior_to_changes, $data_text.selectedText)) {
      completeUndoState({texts: texts})
      text_prior_to_changes = null
    } else {
      cancelProspectiveUndoState()
    }

    $data_text.selectedText = null
  }

  export function pointerup() {
    dragText = null
  }

  export function pointermove() {
    if (!$data_text.usingTextTool) return

    if (dragText) {
      dragText.x = store_panning.curWorldX() - dragX
      dragText.y = store_panning.curWorldY() - dragY
      texts = texts
      $store_has_unsaved_changes = true
    }
  }

  function newText() {
    startUndoState({texts: texts}, `Create Text`)
    let new_text: TextLayerText = {
      id: textId,
      text: '',
      style: structuredClone($data_text.style),
      x: store_panning.curWorldX(),
      y: store_panning.curWorldY(),
      rotation: 0,
    }

    new_text.y = new_text.y - getTextHeight(new_text)

    texts.push(new_text)
    just_created_id = new_text.id

    textId++
    texts = texts
    $data_text.selectedText = texts[texts.length - 1]
    $store_has_unsaved_changes = true

  }

  export function panelControl_applyTextStyle(text: TextLayerText, style: TextStyle) {
    if (just_created_id === null) {
      //startUndoState({texts}, `Restyle text ${text.id}`)
      text.style = structuredClone(style)
      //text_prior_to_changes = structuredClone(text)
      //completeUndoState({texts}, `Restyle text ${text.id}`)
    } else {
      text.style = structuredClone(style)
    }
  }
  
  export function panelControl_deleteText(text: TextLayerText) {
    deleteSelectedText()
  }

  export function deleteSelectedText() {
    if (!$data_text.selectedText) { 
      return
    }
    // Selecting a text makes it the prospective undo state, so cancel that
    cancelProspectiveUndoState() 

    if (just_created_id !== null) {
      deleteText($data_text.selectedText)
      return
    }

    startUndoState({texts}, "Delete Text")
    deleteText($data_text.selectedText)
    completeUndoState({texts})
  }

  export function deleteText(text: TextLayerText) {
    if (text == $data_text.selectedText) { $data_text.selectedText = null }
    let i = texts.indexOf(text)
    texts.splice(i, 1)
    texts = texts
    $store_has_unsaved_changes = true
  }



  export function moveAllTexts(xMod: number, yMod: number) {
    texts.forEach((t) => {
      t.x += xMod
      t.y += yMod
    })

    texts = texts
    $store_has_unsaved_changes = true
  }

  export function handleKeyboardShortcut(shortcutData: shortcut_data) {
    switch (shortcutData.function) {
      case 'toggleItalics':
        $data_text.style.fontStyle = $data_text.style.fontStyle == 'italic' ? 'normal' : 'italic'
        $store_has_unsaved_changes = true
        break

      case 'toggleBold':
        $data_text.style.fontWeight = $data_text.style.fontWeight == 'bold' ? 'normal' : 'bold'
        $store_has_unsaved_changes = true
        break

      case 'deleteText':
        if ($data_text.selectedText) {
	  deleteSelectedText()
	  $store_has_unsaved_changes = true
	}
        break
    }
  }

  let pixi_texts: {[text_id: string]: PIXI.Text & {marked_for_death?: boolean}} = {}
  let cont_pixi_text = new PIXI.Container()
  let grph_selector = new PIXI.Graphics()

  cont_all_text.addChild(cont_pixi_text, grph_selector)

  export function applyTexts(new_texts: TextLayerText[]) {

    texts = new_texts

    for (const text of texts) {

      // Keep the hovered text state nicely interactive
      if (text.id === hoveredText?.id || hoveredText === null) {
	const hoverBox = getTextHoverBox(text)
	const mPos = { 
	  x: store_panning.curWorldX(),
	  y: store_panning.curWorldY(),
	}
	if (mPos.x > hoverBox.x && mPos.x < hoverBox.x + hoverBox.width &&
	mPos.y > hoverBox.y && mPos.y < hoverBox.y + hoverBox.width) {
	  hoveredText = text
	} else {
	  hoveredText = null
	}

      }

      if (!pixi_texts[text.id]) {
	if (text.id === $data_text.selectedText?.id) {
	  deselectText()
	}
	/*
	// wait... this can't ever happen ??/
	if (text.id === hoveredText?.id) {
	  hoveredText = null
	  drawSelectorGraphics()
	}
	*/
	continue // This will be done in afterUpdate
      }

      if (text.id === $data_text.selectedText?.id) {
	$data_text.selectedText = text
	$data_text.style = {...text.style}
	$data_text.style.alpha
      }

      let pixi_text = pixi_texts[text.id]

      // The pointerover event still points at the old object. We need to remove the old event and apply a new one
      pixi_text.off('pointerover')
      pixi_text.on('pointerover', (e) => { hoveredText = text }) 


      //hoveredText = null

    }

    drawSelectorGraphics()
  }


  const drawSelectorGraphics = () => {
    if ($data_text.selectedText) {
      let tW = getTextWidth($data_text.selectedText)
      let tH = getTextHeight($data_text.selectedText)
      let thickness = Math.max($data_text.selectedText.style.fontSize / 10, 4)

      grph_selector.lineStyle(thickness, 0x333333)
      grph_selector.drawRect(
        $data_text.selectedText.x - tW * ALIGN_MAP[$data_text.selectedText.style.align].x - thickness,
        $data_text.selectedText.y - thickness,
        tW + thickness + thickness,
        tH + thickness + thickness,
      )
    }

    if (hoveredText && hoveredText !== $data_text.selectedText) {
      const hoverBox = getTextHoverBox(hoveredText)
      grph_selector.lineStyle(hoverBox.thickness, 0x555555)
      grph_selector.drawRect(
	hoverBox.x,
	hoverBox.y,
	hoverBox.width,
	hoverBox.height
      )
    }
  }

  afterUpdate(() => {
    for (const [text_id, pixi_text] of Object.entries(pixi_texts)) {
      pixi_text.marked_for_death = true
    }

    for (const text of texts) {
      if (!pixi_texts[text.id]) {
	//console.log(`Making new text for ${text.id}`)
        let new_pixi_text = new PIXI.Text()
        new_pixi_text.on('pointerover', (e) => {
	  //console.log('Hovered')
	  hoveredText = text
        })
        new_pixi_text.on('pointerout', (e) => {
          hoveredText = null
        })

        pixi_texts[text.id] = new_pixi_text
        cont_pixi_text.addChild(new_pixi_text)
      }

      let pixi_text = pixi_texts[text.id]
      pixi_text.resolution = $data_text.selectedText?.id == text.id ? 1.25 : 4
      pixi_text.x = text.x
      pixi_text.y = text.y
      pixi_text.text = text.text
      pixi_text.style = text.style
      pixi_text.anchor = ALIGN_MAP[text.style.align]
      pixi_text.alpha = text.style.alpha ? text.style.alpha : 1
      pixi_text.rotation = text.rotation ? text.rotation : 0
      pixi_text.eventMode = $store_selected_tool == Tools.TEXT ? 'static' : 'auto'

      pixi_text.marked_for_death = false
    }

    for (const [text_id, pixi_text] of Object.entries(pixi_texts)) {
      if (pixi_text.marked_for_death) {
	//console.log(`Deleting text ${text_id}`)
	if (parseInt(text_id) === hoveredText?.id) {
	  hoveredText = null
	}
        cont_pixi_text.removeChild(pixi_text)
        delete pixi_texts[text_id]
      }
    }

    /* Selector */
    grph_selector.clear()
    if (!$data_text.usingTextTool) { return }

    drawSelectorGraphics()
  })

  onMount(() => {
    cont_all_text.removeChildren(0)
    //cont_all_text.addChild(trsfm_text)
    cont_pixi_text = new PIXI.Container()
    cont_all_text.addChild(cont_pixi_text)
    cont_all_text.addChild(grph_selector)
  })
</script>
