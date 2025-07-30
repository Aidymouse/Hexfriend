
/** I better make sure I like these names because they can NEVER CHANGE! Or old save versions will need to know what they used to be */
export enum ScaleMode {
    RELATIVE = 'relative',
    BYDIMENSION = 'bydimension',
}
/** Takes an object of width/height and returns a scale such that when applied to width/height they become scaled relative to hex size.
 * The proportion is always of the hexes smaller dimension, and scale is found with corresonding image dimension, then applied to the other dimension as well
 * E.g. if hexes is taller than wide, scale image width so it's proportion_of_hex percent of the hexes width, then apply that scale to height. The result is the original image retains aspect ratio
 * Scaling is such that the source image always retains it's aspect ratio
 * @param texWidth - Width of the base texture
 * @param texHeight - Height of the base texture
 * @param hexWidth - Width of the target hex
 * @param hexHeight - Height of the target hex
 * @param proportion_of_hex - The 
 */
export const get_image_scaled_for_hex_relative = (texWidth: number, texHeight: number, hexWidth: number, hexHeight: number, proportion_of_hex: number) => {

    let scale: number;
    if (hexWidth < hexHeight) {
      scale = (hexWidth * proportion_of_hex) / 100 / texWidth
    } else {
      scale = (hexHeight * proportion_of_hex) / 100 / texHeight
    }

    return { x: scale, y: scale }
}

/** Takes an object of width/height and returns a scale such that when applied to width/height they become scaled relative to hex size 
 * Scales such that the dimension of the image will always be that percentage of the hexes dimension
*/
export const get_image_scaled_for_hex = (texWidth: number, texHeight: number, hexWidth: number, hexHeight: number, proportion_of_hex_width: number, proportion_of_hex_height: number) => {
    return { 
        x: (hexWidth * proportion_of_hex_width) / 100 / texWidth,
        y: (hexHeight * proportion_of_hex_height) / 100 / texHeight 
    }
}