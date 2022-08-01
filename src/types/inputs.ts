import type { tools } from './toolData'

export interface input_state {
    mouseDown: boolean[],

    controlKeysDown: {
        shift: boolean,
        control: boolean,
        alt: boolean
    }
}

export interface shortcut_data {
    function: string,
    tool?: tools
}