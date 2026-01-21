import type { Tile } from './tilesets';

export enum tools {
	TERRAIN = 'terrain',
	ICON = 'icon',
	PATH = 'path',
	TEXT = 'text',
	ERASER = 'eraser',
	OVERLAY = 'overlay'
}

type HexId = `${number}:${number}:${number}`;

/*
interface ToolData {
	$store_selected_tool: tools;

	terrain: {
		tile: Tile;
	};

	icon: {
		icon;
		scale: number;
	};

	path: {
		color: string;
		width: number;
		selectedPath;
	};

	controls: {
		mouseDown: boolean[];
	};
}
*/

export type { HexId };
