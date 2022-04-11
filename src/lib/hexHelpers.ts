export type hexOrientation = 'flatTop' | 'pointyTop';
type cubeCoords = {q: number, r: number, s: number};
import type { TerrainHex } from "src/types/terrain";

export function getHexPath(width: number, height: number, orientation: hexOrientation = 'flatTop', centerX: number = 0, centerY: number = 0): number[] {
    if (orientation == "pointyTop") {
        return [
            centerX, centerY - height / 2,
            centerX + width / 2, centerY - height * 0.25,
            centerX + width / 2, centerY + height * 0.25,
            centerX, centerY + height / 2,
            centerX - width / 2, centerY + height * 0.25,
            centerX - width / 2, centerY - height * 0.25,
        ];
    } else {
        return [
            centerX - width * 0.25, centerY - height / 2,
            centerX + width * 0.25, centerY - height / 2,
            centerX + width / 2, centerY,
            centerX + width * 0.25, centerY + height / 2,
            centerX - width * 0.25, centerY + height / 2,
            centerX - width / 2, centerY,
        ];
    }
}

export function getHexPathRadius(radius: number, orientation: hexOrientation = "flatTop", centerX: number = 0, centerY: number = 0): number[] {
    let w: number, h: number;
    if (orientation == "pointyTop") {
        h = radius * 2;
        w = Math.cos(Math.PI / 6) * radius * 2;

    } else {
        w = radius * 2;
        h = (radius / Math.tan(Math.PI / 6));

    }
    return getHexPath(w, h, orientation, centerX, centerY);
}

export function genHexId(q: number, r: number, s: number): string {
    return q.toString() + ":" + r.toString() + ":" + s.toString();
}


/* COORDS */

function AxialToCube(q: number, r: number): cubeCoords {
    return { q: q, r: r, s: -q - r }
}

export function cube_round(frac: cubeCoords): cubeCoords {
    let q = Math.round(frac.q)
    let r = Math.round(frac.r)
    let s = Math.round(frac.s)

    let q_diff = Math.abs(q - frac.q)
    let r_diff = Math.abs(r - frac.r)
    let s_diff = Math.abs(s - frac.s)

    if (q_diff > r_diff && q_diff > s_diff) {
        q = -r - s
    } else if (r_diff > s_diff) {
        r = -q - s
    } else {
        s = -q - r
    }

    return { q: q, r: r, s: s }
}

export function worldToCube(worldX: number, worldY: number, hexOrientation: hexOrientation, hexWidth: number, hexHeight: number): cubeCoords {
    if (hexOrientation == "flatTop") {
        // This is the inversion of the axialToWorld
        // Of course, substituting -q-r in as S

        let q = worldX / (hexWidth * 0.75)
        let r = ((2 * worldY) / hexHeight - q) / 2

        return cube_round(AxialToCube(q, r));

    } else if (hexOrientation == "pointyTop") {
        // How the fuck am i gonna do this

        let r = worldY / (hexHeight * 0.75)
        let q = ((2 * worldX) / hexWidth - r) / 2

        return cube_round(AxialToCube(q, r));

    }
}

export function cubeToWorld(q: number, r: number, s: number, hexOrientation: hexOrientation, hexWidth: number, hexHeight: number): {x: number, y: number} {
    if (hexOrientation == "flatTop") {
        let hx = q * hexWidth * 0.75
        let hy = r * hexHeight / 2 - s * hexHeight / 2

        return {
            x: hx, //+ (hx > 0 ? -0.5 : 0.5) * this.q,
            y: hy//+ (this.s % 2 == 0 ? this.height/2 : 0)

        }
    } else if (hexOrientation == "pointyTop") {
        return {
            x: q * hexWidth / 2 - s * hexWidth / 2,
            y: r * hexHeight * 0.75 // Negative correct??
        }

    }
}
