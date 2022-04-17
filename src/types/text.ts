export interface text_style {
    fontFamily: string,
    fill: string,
    fontSize: number,
    miterLimit?: number,
    strokeThickness?: number,
    stroke?: string,
    align?: string
}

export interface text_data {
    style: text_style,
    selectedText?: text,
    editorRef: any,
}

export interface text {
    id: number,
    text: string,
    style: text_style,
    x: number,
    y: number
}