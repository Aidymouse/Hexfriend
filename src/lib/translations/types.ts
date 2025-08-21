import type { ScaleMode } from "../../helpers/imageSizing"
import { HexOrientation } from "../../types/terrain"

export type Translation = {
	language: string,
	save_indicator: string,

	general: {
		even: string,
		odd: string,
		export: string,
		import: string,
		reset: string,
		saved: string, // Text that pops up when a map successfully saves
	},

	icons: {
		scale_mode: string, // Header for scale mode
		scale_mode_options: {
			[k in ScaleMode]: string // Label for scale mode options in a dropdown
		}
		scale_relative: string // Label for pHex attribute
		scale_bydimension: { // Label for pHex attribute
			width: string,
			height: string,
		}
	}

	tools: {
		hex_paintbucket: string,
		hex_eraser: string,
		hex_eyedropper: string,
		icon_drag: string,
		icon_erase: string,
		icon_snap: string,
		icon_eyedropper: string,
		path_snap: string,
		eraser_terrain: string,
		eraser_icon: string,
	},

	terrain_panel: {
		terrain_color: string, // Label for terrain color control
		symbol_color: string, // Label for symbol color control
		rotate60_left: string, // Title for rotate button
		rotate60_right: string, // Title for rotate button
		support_warnings: { // Warnings for icon sets that only support certain hex orientations
			[k in HexOrientation]: string
		}
	},

	icon_panel: {
		icon_color: string, // Label for icon color control
		rotate60_left: string, // Rotate button on icon panel
		rotate60_right: string // Rotate buttonon icon panel
		support_warnings: { // Warnings for icon sets that only support certain hex orientations
			[k in HexOrientation]: string
		}
	},

	path_panel: {
		line_ends: string,
		corners: string,
		dashed_line: string,

		switch_end: string,
		deselect: string,
		remove_last: string,
		delete_path: string,

		save_current_style: string,
		update_style_title: string,
		rename_path_style_prompt: string,
		delete_path_style_prompt: string,
		update_style: string,
		rename_style: string,
		duplicate_style: string,
		delete_style: string,
	},

	text_panel: {
		align_left: string,
		align_center: string,
		align_right: string,
		outline: string,
		opacity: string,
		delete_text: string,
		save_current_style: string,
		update_style_title: string,
		update_style: string,
		rename_style: string,
		duplicate_style: string,
		delete_style: string,
		rename_text_style_prompt: string,
		delete_text_style_prompt: string,
	},

	eraser_panel: {
		erase_all_icons: string,
		erase_icons_confirmation: string,
		erase_all_paths: string,
		erase_paths_confirmation: string,
		erase_all_text: string,
		erase_text_confirmation: string,
	},

	overlay_panel: {
		show: string,
		opacity: string,
		reset_scale: string,
		reset_position: string,
		remove: string,
		remove_confirmation: string,
	},

	// Settings

	settings: {
		map_title: string,
		export_as: string,
		exports: {
			png: string,
			scaled_png: string,
			scale_request_dialog: string,
			hexfriend: string,
		},

		grid: {
			title: string,
			show: string,
			thickness: string,
			color: string,
			gap: string,
			large_hexes: {
				title: string,
				size: string,
				color: string,
				outline_thickness: string,
				horizontal_offset: string,
				horizontal_offset_tooltip: string,
				vertical_offset: string,
				vertical_offset_tooltip: string,
				encompasedges: string,
				large_raised_column: string,
				large_indented_row: string,
			},
		},

		hexes: {
			title: string,
			blank_color: string,
			blank_color_reset: string,
			orientation: string,
			pointytop: string,
			flattop: string,
			raised_column: string,
			indented_row: string,
			width: string,
			height: string,
			size_by_radius: string,
			radius_set: string,
			retain_position: string,
			retain_position_explanation: string,
			retain_icons: string,
			retain_paths: string,
			retain_text: string,
			retain_icon_scale: string,
			retain_icon_scale_explanation: string,
		},

		shape: {
			title: string,
			disclaimer: string,
			mapshape: string,
			flower: string,
			square: string,
			hexesout: string,
			addtop: string,
			addbottom: string,
			addleft: string,
			addright: string,
			removetop: string,
			removebottom: string,
			removeleft: string,
			removeright: string,
			removehex: string,
			addhex: string,
		},

		coordinates: {
			title: string,
			disclaimer: string,
			show: string,
			system: string,
			systems: {
				colrow: string,
				axial: string,
				cube: string,
				letternumber: string,
			},
			text_labels: {
				color: string,
				size: string,
				outline_color: string,
				outline_thickness: string
			},
			separator: string,
			space: string,
			offset: {
				row: string,
				column: string,
				q: string,
				r: string,
				s: string
			},
		},

		overlay: {
			title: string,
			load: string,
			replace: string,
		},

		tilesets: {
			title: string,
			import: string,
			builder: string,
			/** @deprecated - No longer used as of Hexfriend 3.0 */
			already_loaded: string,
			make_copy_confirmation: string, // The prompt to import a copy of a tileset
			remove_confirmation: string,
		},

		icon_sets: {
			title: string,
			import: string,
			builder: string,
			/** @deprecated - Hexfriend 3.0 */
			already_loaded: string,
			make_copy_confirmation: string, // The prompt to import a copy of an icon set
		},


		generators: {
			title: string,
			terrain: string,
			icon: string,
		},


		changelog: string,

		about: {
			title: string,
			version: string,
			version_tagline: string, // It's advised you make this one funny little line for this language, that way you don't have to come back and change it for every version. Maybe a hexagon pun or something?

			// These messages are stiched together with a link in the middle in the form start + link + end
			credits: {
				start: string,
				contributorlink: string,
				end: string
			},
			guts: {
				start: string,
				github_link: string,
				end: string
			},
			socials: {
				start: string,
				discord_link: string,
				end: string
			},
			wiki: {
				start: string,
				wiki_link_text: string,
				end: string
			},
			money: {
				start: string,
				kofi_link: string,
				end: string
			},
		},

	},


	builders: {

		author: string,
		author_placeholder: string,
		version: string,
		change_orientation: string,
		duplicate: string,
		supported_orientations: string, // Label for supported orientations dropdown
		supported_orientations_options: { [o in HexOrientation]: string } & { both: string },
		rotation: string // Label for icon and tile symbol rotation controls
		tileset_builder: {
			import_tileset: string,
			export_tileset: string,
			delete: string,
			exit: string,
			name: string,
			name_placeholder: string,
			helptext: string,
			helpsubtitle: string,
			background: string,
			upload_symbol: string,
			replace_symbol: string, // Button text for symbol replace button
			remove_symbol: string, // Button text for symbol remove button
			symbol: string,
			scale: string, // Header for symbol scale
		},
		icon_set_builder: {
			import_iconset: string,
			export_iconset: string,
			delete: string,
			exit: string,
			name: string,
			name_placeholder: string,
			version: string,
			helptext: string,
			helpsubtitle: string,
			helpsubsubtitle: string,
			help_wiki_mention: string,
			tint: string,
			scale: string, // Header for icon scale
		}
	},

	generators: {
		animate: string,
		generate: string,
		close: string,
		clear: string,
		seed: string,
		seed_generation: string,
		clear_confirmation: string,
		clear_before_generation: string,
		icon_generator: {
			place_in_center: string,
			generation_chance: string,
			out_of_connector: string,
			icon_scale: string,
		},
		terrain_generator: {
			preset: string,
		}
	},

	preview_hex_controls: {
		color: string // The label for preview hex color controls
	}



}

