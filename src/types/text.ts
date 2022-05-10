export interface text_style {
    fontFamily: string,
    fill: string,
    fontSize: number,
    miterLimit?: number,
    strokeThickness?: number,
    stroke?: string,
    align?: string,
    fontStyle: string;
    fontWeight: "normal" | "bold" | number;
}


/* HF stands for Hexfriend */
export interface HF_text {
    id: number,
    text: string,
    style: text_style,
    x: number,
    y: number
}