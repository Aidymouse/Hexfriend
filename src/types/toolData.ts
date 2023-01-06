import type { Tile } from './tilesets';

export enum tools {
	TERRAIN = 'terrain',
	ICON = 'icon',
	PATH = 'path',
	TEXT = 'text',
	ERASER = 'eraser',
	OVERLAY = 'overlay'
}

type hex_id = `${number}:${number}:${number}`;

/*
interface ToolData {
	selectedTool: tools;

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

export type { hex_id };
