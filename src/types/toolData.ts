import type { Tile } from './tilesets';

interface path {
	stroke: number;
	strokeThickness: number;
	points: number[];
}

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

export type { ToolData, hex_id };
