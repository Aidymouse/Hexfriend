function generateHexPath(width, height, orientation, centerX, centerY) {

    // The hexagon we generate is actually slightly taller than the width and height we give, because PIXI
    // naturally draws hexes with dots in between... grrr...

    if (orientation == "pointyTop") {        
        return [
            centerX, centerY - height/2,
            centerX + width / 2, centerY - height * 0.25 ,
            centerX + width / 2, centerY + height * 0.25 ,
            centerX, centerY + height / 2 ,
            centerX - width / 2, centerY + height * 0.25 ,
            centerX - width / 2, centerY - height * 0.25 ,
        ];
    } else {
        return [
            centerX - width * 0.25, centerY - height / 2,
            centerX + width * 0.25 , centerY - height / 2,
            centerX + width / 2 , centerY,
            centerX + width * 0.25 , centerY + height / 2,
            centerX - width * 0.25 , centerY + height / 2,
            centerX - width / 2 , centerY,
        ];
    }
}

function generateHexPathWithRadius(radius, orientation, centerX, centerY) {
    let w, h;
    if (orientation == "pointyTop") {
        h = radius * 2; 
        w = Math.cos(Math.PI / 6) * radius * 2;
        
    } else {
        w = radius * 2;
        h = (radius / Math.tan(Math.PI / 6));

    }
    return generateHexPath(w, h, orientation, centerX, centerY)
}

 // COORDINATES

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


function worldToAxial(worldX, worldY, hexOrientation, hexWidth, hexHeight) {
    if (hexOrientation == "flatTop") {
        // This is the inversion of the axialToWorld
        // Of course, substituting -q-r in as S

        let q = worldX / (hexWidth * 0.75)
        let r = ((2 * worldY) / hexHeight - q) / 2

        return cube_round(AxialToCube(q, r));

    } else if (hexOrientation == "pointyTop") {
        // How the fuck am i gonna do this
        
        let r = worldY / (hexHeight*0.75)
        let q = ((2 * worldX) / hexWidth - r) / 2

        return cube_round(AxialToCube(q, r));

    }
}

function axialToWorld(q, r, s, hexOrientation, hexWidth, hexHeight) {
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