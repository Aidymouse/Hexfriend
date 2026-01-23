import { ScaleMode } from '../../helpers/imageSizing'
import { HexOrientation } from '../../types/terrain'
import { type Translation } from './types'

/** This placeholder translation is used as a fallback for incomplete translations. Translations are merged with the placeholder when switched in */
export const placeholder_translation: Translation = {
  language: 'TODO',
  save_indicator: 'TODO',

  general: {
    even: 'TODO',
    odd: 'TODO',
    export: 'TODO',
    import: 'TODO',
    reset: 'TODO',
    saved: 'TODO', // Text that pops up when a map successfully saves
  },

  icons: {
    scale_mode: 'TODO', // Header for scale mode
    scale_mode_options: {
      [ScaleMode.RELATIVE]: 'TODO',
      [ScaleMode.BYDIMENSION]: 'TODO',
    },
    scale_relative: 'TODO', // Label for pHex attribute
    scale_bydimension: {
      // Label for pHex attribute
      width: 'TODO',
      height: 'TODO',
    },
  },

  tools: {
    hex_paintbucket: 'TODO',
    hex_eraser: 'TODO',
    hex_eyedropper: 'TODO',
    icon_drag: 'TODO',
    icon_erase: 'TODO',
    icon_snap: 'TODO',
    icon_eyedropper: 'TODO',
    path_snap: 'TODO',
    eraser_terrain: 'TODO',
    eraser_icon: 'TODO',
  },

  terrain_panel: {
    terrain_color: 'TODO', // Label for terrain color control
    symbol_color: 'TODO', // Label for symbol color control
    rotate60_left: 'TODO', // Title for rotate button
    rotate60_right: 'TODO', // Title for rotate button
    support_warnings: {
      // Warnings for icon sets that only support certain hex orientations
      [HexOrientation.FLATTOP]: 'TODO',
      [HexOrientation.POINTYTOP]: 'TODO',
    },
  },

  icon_panel: {
    icon_color: 'TODO', // Label for icon color control
    rotate60_left: 'TODO', // Rotate button on icon panel
    rotate60_right: 'TODO', // Rotate buttonon icon panel
    support_warnings: {
      // Warnings for icon sets that only support certain hex orientations
      [HexOrientation.FLATTOP]: 'TODO',
      [HexOrientation.POINTYTOP]: 'TODO',
    },
  },

  path_panel: {
    line_ends: 'TODO',
    corners: 'TODO',
    dashed_line: 'TODO',

    switch_end: 'TODO',
    deselect: 'TODO',
    remove_last: 'TODO',
    delete_path: 'TODO',

    save_current_style: 'TODO',
    update_style_title: 'TODO',
    rename_path_style_prompt: 'TODO',
    delete_path_style_prompt: 'TODO',
    update_style: 'TODO',
    rename_style: 'TODO',
    duplicate_style: 'TODO',
    delete_style: 'TODO',
  },

  text_panel: {
    align_left: 'TODO',
    align_center: 'TODO',
    align_right: 'TODO',
    outline: 'TODO',
    opacity: 'TODO',
    delete_text: 'TODO',
    save_current_style: 'TODO',
    update_style_title: 'TODO',
    update_style: 'TODO',
    rename_style: 'TODO',
    duplicate_style: 'TODO',
    delete_style: 'TODO',
    rename_text_style_prompt: 'TODO',
    delete_text_style_prompt: 'TODO',
  },

  eraser_panel: {
    erase_all_icons: 'TODO',
    erase_icons_confirmation: 'TODO',
    erase_all_paths: 'TODO',
    erase_paths_confirmation: 'TODO',
    erase_all_text: 'TODO',
    erase_text_confirmation: 'TODO',
  },

  overlay_panel: {
    show: 'TODO',
    opacity: 'TODO',
    reset_scale: 'TODO',
    reset_position: 'TODO',
    remove: 'TODO',
    remove_confirmation: 'TODO',
  },

  // Settings

  settings: {
    map_title: 'TODO',
    export_as: 'TODO',
    exports: {
      png: 'TODO',
      scaled_png: 'TODO',
      scale_request_dialog: 'TODO',
      hexfriend: 'TODO',
    },

    grid: {
      title: 'TODO',
      show: 'TODO',
      thickness: 'TODO',
      color: 'TODO',
      gap: 'TODO',
      large_hexes: {
        title: 'TODO',
        size: 'TODO',
        color: 'TODO',
        outline_thickness: 'TODO',
        horizontal_offset: 'TODO',
        horizontal_offset_tooltip: 'TODO',
        vertical_offset: 'TODO',
        vertical_offset_tooltip: 'TODO',
        encompasedges: 'TODO',
        large_raised_column: 'TODO',
        large_indented_row: 'TODO',
      },
    },

    hexes: {
      title: 'TODO',
      blank_color: 'TODO',
      blank_color_reset: 'TODO',
      orientation: 'TODO',
      pointytop: 'TODO',
      flattop: 'TODO',
      raised_column: 'TODO',
      indented_row: 'TODO',
      width: 'TODO',
      height: 'TODO',
      size_by_radius: 'TODO',
      radius_set: 'TODO',
      retain_position: 'TODO',
      retain_position_explanation: 'TODO',
      retain_icons: 'TODO',
      retain_paths: 'TODO',
      retain_text: 'TODO',
      update_icon_scale: 'TODO',
      update_icon_scale_explanation: 'TODO',
    },

    shape: {
      title: 'TODO',
      disclaimer: 'TODO',
      shape_change_warning: 'TODO',
      high_hexesout_warning: 'TODO',
      mapshape: 'TODO',
      flower: 'TODO',
      square: 'TODO',
      hexesout: 'TODO',
      addtop: 'TODO',
      addbottom: 'TODO',
      addleft: 'TODO',
      addright: 'TODO',
      removetop: 'TODO',
      removebottom: 'TODO',
      removeleft: 'TODO',
      removeright: 'TODO',
      removehex: 'TODO',
      addhex: 'TODO',
    },

    coordinates: {
      title: 'TODO',
      disclaimer: 'TODO',
      show: 'TODO',
      system: 'TODO',
      systems: {
        colrow: 'TODO',
        axial: 'TODO',
        cube: 'TODO',
        letternumber: 'TODO',
      },
      text_labels: {
        color: 'TODO',
        size: 'TODO',
        outline_color: 'TODO',
        outline_thickness: 'TODO',
      },
      separator: 'TODO',
      space: 'TODO',
      offset: {
        row: 'TODO',
        column: 'TODO',
        q: 'TODO',
        r: 'TODO',
        s: 'TODO',
      },
    },

    overlay: {
      title: 'TODO',
      load: 'TODO',
      replace: 'TODO',
    },

    tilesets: {
      title: 'TODO',
      import: 'TODO',
      builder: 'TODO',
      /** @deprecated - No longer used as of Hexfriend 3.0 */
      already_loaded: 'TODO',
      make_copy_confirmation: 'TODO', // The prompt to import a copy of a tileset
      remove_confirmation: 'TODO',
    },

    icon_sets: {
      title: 'TODO',
      import: 'TODO',
      builder: 'TODO',
      /** @deprecated - Hexfriend 3.0 */
      already_loaded: 'TODO',
      make_copy_confirmation: 'TODO', // The prompt to import a copy of an icon set
    },

    generators: {
      title: 'TODO',
      terrain: 'TODO',
      icon: 'TODO',
    },

    changelog: 'TODO',

    about: {
      title: 'TODO',
      version: 'TODO',
      version_tagline: 'TODO', // It's advised you make this one funny little line for this language, that way you don't have to come back and change it for every version. Maybe a hexagon pun or something?

      // These messages are stiched together with a link in the middle in the form start + link + end
      credits: {
        start: 'TODO',
        contributorlink: 'TODO',
        end: 'TODO',
      },
      guts: {
        start: 'TODO',
        github_link: 'TODO',
        end: 'TODO',
      },
      socials: {
        start: 'TODO',
        discord_link: 'TODO',
        end: 'TODO',
      },
      wiki: {
        start: 'TODO',
        wiki_link_text: 'TODO',
        end: 'TODO',
      },
      money: {
        start: 'TODO',
        kofi_link: 'TODO',
        end: 'TODO',
      },
    },
  },

  builders: {
    author: 'TODO',
    author_placeholder: 'TODO',
    version: 'TODO',
    change_orientation: 'TODO',
    duplicate: 'TODO',
    supported_orientations: 'TODO', // Label for supported orientations dropdown
    supported_orientations_options: {
      [HexOrientation.POINTYTOP]: 'TODO',
      [HexOrientation.FLATTOP]: 'TODO',
      ['both']: 'TODO',
    },
    rotation: 'TODO', // Label for icon and tile symbol rotation controls
    tileset_builder: {
      import_tileset: 'TODO',
      export_tileset: 'TODO',
      delete: 'TODO',
      exit: 'TODO',
      name: 'TODO',
      name_placeholder: 'TODO',
      helptext: 'TODO',
      helpsubtitle: 'TODO',
      background: 'TODO',
      upload_symbol: 'TODO',
      replace_symbol: 'TODO', // Button text for symbol replace button
      remove_symbol: 'TODO', // Button text for symbol remove button
      symbol: 'TODO',
      scale: 'TODO', // Header for symbol scale
    },
    icon_set_builder: {
      import_iconset: 'TODO',
      export_iconset: 'TODO',
      delete: 'TODO',
      exit: 'TODO',
      name: 'TODO',
      name_placeholder: 'TODO',
      version: 'TODO',
      helptext: 'TODO',
      helpsubtitle: 'TODO',
      helpsubsubtitle: 'TODO',
      help_wiki_mention: 'TODO',
      tint: 'TODO',
      scale: 'TODO', // Header for icon scale
    },
  },

  generators: {
    animate: 'TODO',
    generate: 'TODO',
    close: 'TODO',
    clear: 'TODO',
    seed: 'TODO',
    seed_generation: 'TODO',
    clear_confirmation: 'TODO',
    clear_before_generation: 'TODO',
    icon_generator: {
      place_in_center: 'TODO',
      generation_chance: 'TODO',
      out_of_connector: 'TODO',
      icon_scale: 'TODO',
    },
    terrain_generator: {
      preset: 'TODO',
    },
  },

  preview_hex_controls: {
    color: 'TODO', // The label for preview hex color controls
  },
}
