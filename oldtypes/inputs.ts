import type { Tools } from './toolData';

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
	tool?: Tools;
	display: string;
	displayKeycode?: string;
}
