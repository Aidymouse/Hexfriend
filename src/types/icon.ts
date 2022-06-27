export interface Icon {
    display: string
    texId: string
    color: number
    pHex: number // percent of total hex taken up
    base64: string
    preview: string
}

export interface Iconset {
    name: string
    id: string
    author: string
    icons: Icon[]
}