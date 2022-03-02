function generateHexPath(width, height, orientation, centerX, centerY) {
    if (orientation == "pointyTop") {
        return [
            centerX, centerY - height/2,
            centerX + width/2, centerY - height * 0.25,
            centerX + width/2, centerY + height * 0.25,
            centerX, centerY + height/2,
            centerX - width/2, centerY + height * 0.25,
            centerX - width/2, centerY - height * 0.25,
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


function generateHexTexture(hexPath) {
    console.log("generating hex texture")
    let g = new PIXI.Graphics();

    g.beginFill(0xffffff)
    g.drawPolygon(hexPath)
    g.endFill();

    let t = primaryRenderer.generateTexture(g);
    
    g.destroy();

    return t;
}

function AxialToCube(q, r) {
    return {q: q, r: r, s: -q-r}
}

function cube_round(frac) {
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

    return {q: q, r: r, s: s}
}


/**
* Convert a screen point to a hex coordinate
*/
function PointToCoord(x, z) {
    x = (x - halfHexWidth) / hexWidth;

    let t1 = z / hexRadius, t2 = Math.Floor(x + t1);
    let r = Math.Floor((Math.Floor(t1 - x) + t2) / 3);
    let q = Math.Floor((Math.Floor(2 * x + 1) + t2) / 3) - r;

    return new Coord(q, r);
}