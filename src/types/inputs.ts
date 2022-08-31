import type { tools } from './toolData';

export interface input_state {
	mouseDown: boolean[];

	controlKeysDown: {
		shift: boolean;
		control: boolean;
		alt: boolean;
	};
}

export interface shortcut_data {
	keycode: string;
	function: string;
	tool?: tools;
	display: string;
	displayKeycode?: string;
}
