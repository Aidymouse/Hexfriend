export interface Icon {
    display: string
    texId: string
    id: string
    color: number
    pHex: number // percent of total hex taken up
    base64: string
    preview: string
    texWidth: number
    texHeight: number
}

export interface Iconset {
    name: string
    id: string
    author: string
    version: number
    icons: Icon[]
}