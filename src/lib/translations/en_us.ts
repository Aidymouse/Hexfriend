export const en_us = {
	language: "en_us",
	save_indicator: "Saving...",

	general: {
		even: "Even",
		odd: "Odd",
		export: "Export",
		import: "Import",
		reset: "Reset",
	},

	tools: {
		hex_paintbucket: "Hex Paintbucket",
		hex_eraser: "Hex Eraser",
		hex_eyedropper: "Hex Eyedropper",
		icon_drag: "Drag Icons",
		icon_erase: "Icon Eraser",
		icon_snap: "Snap Icon",
		icon_eyedropper: "Icon Eyedropper",
		path_snap: "Snap Path Point",
		eraser_terrain: "Erase Terrain",
		eraser_icon: "Erase Icons",
	},
	
	terrain_panel: {
		terrain_color: "Terrain Color",
		symbol_color: "Symbol Color",
	},

	icon_panel: {
		icon_color: "Icon Color",	
	},

	path_panel: {
		line_ends: "Line Ends",
		corners: "Corners",
		dashed_line: "Dashed Line",

		switch_end: "Switch End",
		deselect: "Deselect Path",
		remove_last: "Remove Last Point",
		delete_path: "Delete Path",

		save_current_style: "Save current path style",
		update_style_title: "Update this path style to match what is currently set above.",
		update_style: "Update Style",
		rename_style: "Rename",
		duplicate_style: "Duplicate",
		delete_style: "Delete",
	},

	text_panel: {
		align_left: "Left Align",
		align_center: "Center Align",
		align_right: "Right Align",
		outline: "Outline",
		opacity: "Opacity",
		delete_text: "Delete Selected Text",
		save_current_style: "Save current text style",
		update_style_title: "Update this path style to match what is currently set above",
		update_style: "Update Style",
		rename_style: "Rename",
		duplicate_style: "Duplicate",
		delete_style: "Delete",
	},

	eraser_panel: {
		erase_all_icons: "Erase All Icons",
		erase_icons_confirmation: "Really erase all icons?",
		erase_all_paths: "Erase All Paths",
		erase_paths_confirmation: "Really erase all paths?",
		erase_all_text: "Erase All Text",
		erase_text_confirmation: "Really erase all text?",
	},

	overlay_panel: {
		show: "Show",
		opacity: "Opacity",
		reset_scale: "Reset Scale",
		reset_position: "Reset Position",
		remove: "Remove Overlay",
		remove_confirmation: "Remove overlay?",
	},

	// Settings

	settings: {
		map_title: "Map Title",
		export_as: "Export As...",
		exports: {
			png: "PNG",
			scaled_png: "Scaled PNG",
			scale_request_dialog: "Scale by what percentage?",
			hexfriend: "Hexfriend",
		},

		grid: {
			title: "Grid",
			show: "Show Grid",
			thickness: "Grid Thickness",
			color: "Grid Color",
			gap: "Gap",
			large_hexes: {
				title: "Large Hexes",
				size: "Size",
				color: "Color",
				outline_thickness: "Outline Thickness",
				horizontal_offset: "Horizontal Offset",
				vertical_offset: "Vertical Offset",
				encompasedges: "Encompass Map Edges",
				large_raised_column: "Large Raised Column",
				large_indented_row: "Large Indented Row",
			},
		},
		
		hexes: {
			title: "Hexes",
			blank_color: "Blank Hex Color",
			blank_color_reset: "Reset",
			orientation: "Hex Orientation",
			pointytop: "Pointy Top",
			flattop: "Flat Top",
			raised_column: "Raised Column",
			indented_row: "Indented Row",
			width: "Hex Width",
			height: "Hex Height",
			size_by_radius: "Size by Radius",
			radius_set: "Set",
			retain_position: "Retain Position",
			retain_position_explanation: "Selected objects will attempt to remain in their hex when they are resized",
			retain_icons: "Icons",
			retain_paths: "Path",
			retain_text: "Text",
		},
		
		shape: {
			title: "Shape and Size",
			disclaimer: "Hexes removed by a reduction in map size are completely erased.",
			mapshape: "Map Shape",
			flower: "Flower",
			square: "Square",
			hexesout: "Hexes out from center",
			addtop: "Add Top",
			addbottom: "Add Bottom",
			addleft: "Add Left",
			addright: "Add Right",
			removetop: "Remove Top",
			removebottom: "Remove Bottom",
			removeleft: "Remove Left",
			removeright: "Remove Right",
			removehex: "Remove Hex",
			addhex: "Add Hex",
		},

		coordinates: {
			title: "Coordinates",
			disclaimer: "Coordinates can slow down map changes such as adding hexes or changing orientation.",
			show: "Show Coordinates",
			system: "Coordinate System",
			systems: {
				colrow: "Column, Row",
				axial: "Axial",
				cube: "Cube",
				letternumber: "Letter Number",
			},
			text_labels: {
				color: "Color",
				size: "Font Size",
				outline_color: "Outline Color",
				outline_thickness: "Outline Thickness"
			},
			separator: "Separator",
			space: "Space from bottom",
			offset: {
				row: "Row Offset",
				column: "Column Offset",
				q: "Q offset",
				r: "R offset",
				s: "S offset"
			},
		},

		overlay: {
			title: "Overlay",
			load: "Load Overlay Image",
			replace: "Replace Overlay Image",
		},

		tilesets: {
			title: "Tilesets",
			import: "Import Tileset",
			builder: "Tileset Builder",
			already_loaded: "You've already loaded this tileset :)",
			remove_confirmation: "This will remove all tiles in use from this set. Continue?",
		},
		
		icon_sets: {
			title: "Icon Sets",
			import: "Import Icon Set",
			builder: "Icon Set Builder",
			already_loaded: "You've already imported this icon set :)",
		},


		generators: {
			title: "Generators",
			terrain: "Terrain Generator",
			icon: "Icon Generator",
		},


		changelog: "Changelog",

		about: {
			title: "About",
			version: "version",
			version_tagline: "\"Whole new worlds, Hexfriend!\"", // It's advised you make this one funny little line for this language, that way you don't have to come back and change it for every version. Maybe a hexagon pun or something?
			
			// These messages are stiched together with a link in the middle in the form start + link + end
			credits: { 
				start: "By Aidymouse and all the wonderful",
				contributorlink: "contributors",
				end: ""
			},
			guts: {
				start: "Hexfriend is built with Svelte, Pixi JS and Typescript. Check out the ",
				github_link: "Github",
				end: ""
			},
			socials: {
				start: "Found a bug? Got ideas? Come say Hi on the ",
				discord_link: "Hexfriend Discord",
				end: ""
			},
			money: {
				start: "You can give away your hard earned money on ",
				kofi_link: "Ko-fi.",
				end: ""
			},
		},

	},


	builders: {

		author: "Author",
		author_placeholder: "You!",
		version: "Version",
		change_orientation: "Change Hex Orientation",
		duplicate: "Duplicate this hex",
		tileset_builder: {
			delete: "Delete this hex",
			exit: "Exit Tileset Builder",
			name: "Tileset Name",
			name_placeholder: "Tileset Name",
			helptext: "Select a tile or make a new one!",
			helpsubtitle: "For best results, use white 100px by 100px images for symbols.",
			background: "Background",
			upload_symbol: "Upload Symbol",
			symbol: "Symbol",
			symbol_scale: "Symbol Scale",
		},
		icon_set_builder: {
			delete: "Delete this icon",
			exit: "Exit Icon Set Builder",
			name: "Icon Set Name",
			name_placeholder: "New Icon Set",
			version: "Version",
			helptext: "Select an icon or make a new one!",
			helpsubtitle: "For best results, use white 100px by 100px images.",
			helpsubsubtitle: "Hint: You can upload multiple images at once!",
			tint: "Tint",
			scale: "Icon Scale",
		}
	},

	generators: {
		animate: "Animate",
		generate: "Generate",
		close: "Close",
		clear: "Clear",
		seed: "Seed",
		seed_generation: "Seed Generation",
		clear_confirmation: "Are you sure?",
		clear_before_generation: "Clear Before Generation",
		icon_generator: {
			place_in_center: "Place In Hex Center",
			generation_chance: "Generation Chance",
			out_of_connector: "in",
			icon_scale: "Scale",
		},
		terrain_generator: {
			preset: "Preset",
		}
	},



}
