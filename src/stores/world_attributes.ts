import { HexOrientation } from "../types/terrain"

interface world_attributes {
    hex_height: number;
    hex_width: number;
    orientation: HexOrientation;
}

let world_attributes = {
    hex_height: 45,
    hex_width: 50,
    orientation: HexOrientation.FLATTOP
}