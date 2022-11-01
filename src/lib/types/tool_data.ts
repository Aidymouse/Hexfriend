import type { Tile } from '$lib/types/tilesets';
import type { Icon } from '$lib/types/icon';
import type { path_layer_path } from '$lib/types/path';

export enum tools {
	TERRAIN = 'terrain',
	ICON = 'icon',
	PATH = 'path',
	TEXT = 'text',
	ERASER = 'eraser',
}

type hex_id = `${number}:${number}:${number}`;

interface ToolData {
	selectedTool: tools;

	terrain: {
		tile: Tile;
	};

	icon: {
		icon?: Icon;
		scale: number;
	};

	path: {
		color: string;
		width: number;
		selectedPath?: path_layer_path;
	};

	controls: {
		mouseDown: boolean[];
	};
}

export type { ToolData, hex_id };
