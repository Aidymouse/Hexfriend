<script lang="ts">
  import type { eraser_data, icon_data } from '../types/data'
  import type { IconLayerIcon, Icon } from '../types/icon'
  import type { shortcut_data } from '../types/inputs'
  import type { pan_state } from '../types/panning'
  import type { terrain_field } from '../types/terrain'
  import type { cube_coords } from '../types/coordinates'
  import { HexOrientation } from '../types/terrain'

  import { tools } from '../types/toolData'
  import { map_shape } from '../types/settings'
  import { store_has_unsaved_changes } from '../stores/flags'

  import * as store_panning from '../stores/panning'
  import { tfield } from '../stores/tfield'
  import { store_inputs } from '../stores/inputs'
  import { store_selected_tool } from '../stores/tools'
  import { data_icon, data_eraser } from '../stores/data'
  import { resize_parameters } from '../stores/resize_parameters'

  import {
    coords_cubeToWorld,
    coords_cubeToq,
    coords_cubeTor,
    coords_qToCube,
    coords_rToCube,
    coords_worldToCube,
  } from '../helpers/hexHelpers'
  import * as PIXI from 'pixi.js'
  import { get_icon_texture } from '../lib/texture_loader'
  import { afterUpdate, onMount } from 'svelte'

  import { get_icon_scale_for_hex } from '../helpers/imageSizing'
  import { find_new_pos_through_resize, type HexSizeParams } from '../lib/map_resize'
  export let icons: IconLayerIcon[] = []
  let pixi_icons: { [icon_id: number]: PIXI.Sprite } = {} // keeps up to date with icons

  export let cont_icon: PIXI.Container

  // seems unused - check back later?
  // let pan: pan_state;
  // store_panning.store.subscribe((newPan) => {
  // 	pan = newPan;
  // });

  //let floatingIcon: IconLayerIcon | null = null
  let draggedIcon: IconLayerIcon | null = null

  let iconId: number = 0
  icons.forEach((i) => (iconId = Math.max(iconId, i.onLayerId)))
  iconId++

  let spr_floating_icon = new PIXI.Sprite()
  spr_floating_icon.anchor.x = 0.5
  spr_floating_icon.anchor.y = 0.5
  spr_floating_icon.alpha = 0.5

  $: {
    // Ideally, this would only trigger on a load. It can trigger on any update for now though...
    icons.forEach((i) => (iconId = Math.max(iconId, i.onLayerId)))
    iconId++
  }

  $: {
    //$store_selected_tool = $store_selected_tool
  }

  export function retain_icon_position_on_hex_resize(
    old_hex_size: HexSizeParams,
    new_hex_size: HexSizeParams,
    orientation: HexOrientation,
  ) {
    icons.forEach((icon: IconLayerIcon) => {
      const new_pos = find_new_pos_through_resize({ x: icon.x, y: icon.y }, old_hex_size, new_hex_size, orientation)
      icon.x = new_pos.x
      icon.y = new_pos.y
    })

    icons = icons
  }

  function get_icon_position(): { iconX: number; iconY: number } {
    let iconX = store_panning.curWorldX()
    let iconY = store_panning.curWorldY()

    if ($data_icon.snapToHex) {
      let clickedHexCoords = coords_worldToCube(
        store_panning.curWorldX(),
        store_panning.curWorldY(),
        $tfield.orientation,
        $tfield.hexWidth,
        $tfield.hexHeight,
        $tfield.grid.gap,
      )
      let iconCoords = coords_cubeToWorld(
        clickedHexCoords.q,
        clickedHexCoords.r,
        clickedHexCoords.s,
        $tfield.orientation,
        $tfield.hexWidth,
        $tfield.hexHeight,
        $tfield.grid.gap,
      )
      iconX = iconCoords.x
      iconY = iconCoords.y
    }

    return { iconX, iconY }
  }

  export function placeIcon() {
    const { iconX, iconY } = get_icon_position()

    let newIcon: IconLayerIcon = {
      ...$data_icon.icon,
      x: iconX,
      y: iconY,
      onLayerId: iconId,
      texId: $data_icon.icon.texId,
      rotation: $data_icon.icon.rotation,
      scale: get_icon_scale_for_hex($data_icon.icon, { hexWidth: $tfield.hexWidth, hexHeight: $tfield.hexHeight }),
    }

    icons.push(newIcon)
    iconId++
    icons = icons

    $store_has_unsaved_changes = true
  }

  function deleteIcon(icon: IconLayerIcon) {
    let iconIndex = icons.indexOf(icon)
    icons.splice(iconIndex, 1)
    icons = icons

    $store_has_unsaved_changes = true
  }

  export function deleteIcons() {
    icons = []

    $store_has_unsaved_changes = true
  }

  export function pointerdown() {
    if ($data_icon.usingEraser) return
    if ($data_icon.dragMode) return
    if ($data_icon.usingEyedropper) return

    placeIcon()
    //createFloatingIcon();
  }

  export function pointerup() {
    draggedIcon = null
    //if ($data_icon.usingEraser) return;

    //newIcon();
    //destroyFloatingIcon();
  }

  export function pointermove() {
    //if (floatingIcon)
    if (draggedIcon) updateDraggedIcon()

    updateFloatingIcon()
    cursorOnLayer = true
  }

  let cursorOnLayer: boolean = false
  export function pointerout(e: PointerEvent) {
    cursorOnLayer = false
    spr_floating_icon.visible = false // Not too happy about this but it's fine
  }

  // Floating icons have a few bugs / polish requried:
  // - Icon appears weirdly when icon layer is switched too, will need to update when layer is switched to - still true?

  function updateFloatingIcon() {
    const { iconX, iconY } = get_icon_position()
    const icon_scale = get_icon_scale_for_hex($data_icon.icon, $tfield)

    spr_floating_icon.visible = false
    console.log('Updating floating icon')
    spr_floating_icon.visible =
      !$data_icon.usingEraser &&
      $store_selected_tool == tools.ICON &&
      cursorOnLayer &&
      !$data_icon.dragMode &&
      draggedIcon == null &&
      !$data_icon.usingEyedropper
    spr_floating_icon.texture = get_icon_texture($data_icon.icon.texId)
    spr_floating_icon.tint = $data_icon.icon.color

    const matrix = new PIXI.Matrix()
      .rotate(PIXI.DEG_TO_RAD * $data_icon.icon.rotation)
      .scale(icon_scale.x, icon_scale.y)
    spr_floating_icon.transform.setFromMatrix(matrix)
    spr_floating_icon.x = iconX
    spr_floating_icon.y = iconY
    spr_floating_icon.tint = $data_icon.icon.color
    // spr_floating_icon.eventMode = 'static' // !!! TODO
  }

  /** Hide floating icon when tool is changed */
  store_selected_tool.subscribe((n) => {
    if (n !== tools.ICON) {
      spr_floating_icon.visible = false
    } else {
      spr_floating_icon.visible = true
    }
  })

  export function moveAllIcons(xMod: number, yMod: number) {
    icons.forEach((icon) => {
      icon.x += xMod
      icon.y += yMod
    })

    icons = icons
  }

  // This is called during layer set up when maps are loaded, or when hex fields are focused on.

  export function handleKeyboardShortcut(shortcutData: shortcut_data) {
    switch (shortcutData.function) {
      case 'toggleSnap': {
        $data_icon.snapToHex = !$data_icon.snapToHex
        pointermove()
        break
      }

      case 'toggleEraser': {
        $data_icon.usingEraser = !$data_icon.usingEraser
        break
      }

      // Drag mode handled by key up and key down
    }
  }

  export function keyup(e: KeyboardEvent) {
    switch (e.key) {
      case 'Shift':
        $data_icon.usingEraser = false
        break

      case 'Control':
        $data_icon.dragMode = false
        break

      case 'Alt':
        $data_icon.usingEyedropper = false
        break
    }
  }

  export function keydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Shift':
        $data_icon.usingEraser = true
        break

      case 'Control':
        $data_icon.dragMode = true
        break

      case 'Alt':
        $data_icon.usingEyedropper = true
        break
    }
  }

  function shouldEraseIcons(): boolean {
    return ($store_selected_tool == tools.ERASER && $data_eraser.eraseIcons) || $data_icon.usingEraser
  }

  let dragOffsetX = 0
  let dragOffsetY = 0
  function icon_pointerdown(e: PIXI.FederatedPointerEvent, clicked_icon: IconLayerIcon) {
    if (shouldEraseIcons()) {
      deleteIcon(clicked_icon)
      $store_has_unsaved_changes = true
    } else if ($data_icon.dragMode && draggedIcon == null) {
      draggedIcon = clicked_icon
      dragOffsetX = store_panning.curWorldX() - clicked_icon.x
      dragOffsetY = store_panning.curWorldY() - clicked_icon.y
    } else if ($data_icon.usingEyedropper) {
      $data_icon.icon = { ...clicked_icon }
      $data_icon.usingEyedropper = false

      updateFloatingIcon()
    }
  }

  function icon_pointerover(e: PIXI.FederatedPointerEvent, icon: IconLayerIcon) {
    if ($store_inputs.mouseDown[0] && shouldEraseIcons()) deleteIcon(icon)
  }

  function updateDraggedIcon() {
    const { iconX, iconY } = get_icon_position()

    icons = icons
    $store_has_unsaved_changes = true
  }

  afterUpdate(() => {
    let marked_for_saving: number[] = []

    // Update icons to be in line with state
    icons.forEach((icon) => {
      // if the icon doesn't exist
      if (!pixi_icons[icon.onLayerId]) {
        // Create icon
        let new_icon = new PIXI.Sprite(get_icon_texture(icon.texId))
        new_icon.anchor.x = 0.5
        new_icon.anchor.y = 0.5
        // register icon events
        new_icon.on('pointerdown', (e) => {
          icon_pointerdown(e, icon)
        })
        new_icon.on('pointerover', (e) => {
          icon_pointerover(e, icon)
        })
        // add the icon
        pixi_icons[icon.onLayerId] = new_icon
        cont_icon.addChild(new_icon)
      }

      /** We use a matrix because to scale bydimension in the desired way rotation must happen first. Setting scale and rotation does scale first */
      const rotate_scale_matrix = new PIXI.Matrix()
        .rotate(PIXI.DEG_TO_RAD * (icon.rotation ?? 0))
        .scale(icon.scale.x, icon.scale.y)

      pixi_icons[icon.onLayerId].transform.setFromMatrix(rotate_scale_matrix) // Do this first or the other stuff you set is wrong
      pixi_icons[icon.onLayerId].x = icon.x
      pixi_icons[icon.onLayerId].y = icon.y
      pixi_icons[icon.onLayerId].tint = icon.color
      //pixi_icons[icon.onLayerId].scale.x = icon.scale.x
      //pixi_icons[icon.onLayerId].scale.y = icon.scale.y
      //pixi_icons[icon.onLayerId].rotation = PIXI.DEG_TO_RAD * (icon.rotation ?? 0)
      pixi_icons[icon.onLayerId].eventMode =
        $store_selected_tool == tools.ICON || $store_selected_tool == tools.ERASER ? 'static' : 'auto'

      marked_for_saving.push(icon.onLayerId)
    })

    Object.keys(pixi_icons).forEach((icon_id) => {
      if (!marked_for_saving.includes(+icon_id)) {
        // this can be slow when using the generator
        cont_icon.removeChild(pixi_icons[icon_id])
        // this is not the problem
        delete pixi_icons[icon_id]
      }
    })
  })

  onMount(() => {
    cont_icon.removeChildren(0)
    cont_icon.addChild(spr_floating_icon)
  })
</script>
