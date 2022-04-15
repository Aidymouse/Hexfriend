<script lang="ts">

    import { Text, Graphics } from 'svelte-pixi'
    import * as PIXI from 'pixi.js'

    export let pan;
    
    export let data_text;
    let hoveredText;

    let dragText;
    let dragX; // offset from the 
    let dragY;

    export let texts = [
        // {text: string, style: object }
    ];
    
    let textId = 0;
    texts.forEach(t => textId = Math.max(textId, t.id))
    textId++

    $: {
        if (data_text.selectedText) data_text.selectedText.style = {...data_text.style}
        texts = texts
    }

    export function pointerdown() {

        if (data_text.selectedText && hoveredText) {
            selectText()
            setTimeout(() => { data_text.editorRef.focus() }, 10) /* I wish I didn't have to do this, and I'm sure it's terrible, but it doesnt work with it :/ */
            
        } else if (data_text.selectedText) {
            if (data_text.selectedText.text == "") deleteText(data_text.selectedText)
            data_text.selectedText = null
            
        } else if (hoveredText) {
            selectText()
            
        } else {
            newText()
        }
    }

    function selectText() {
        data_text.style = {...hoveredText.style}
        data_text.selectedText = hoveredText
        dragText = data_text.selectedText
        dragX = pan.worldX - hoveredText.x
        dragY = pan.worldY - hoveredText.y
    }

    export function pointerup() {
        dragText = null
    }

    export function pointermove() {
        if (dragText) {
            dragText.x = pan.worldX - dragX
            dragText.y = pan.worldY - dragY
            texts = texts
        }
    }

    function newText() {
        texts.push( {id: textId, text: "", style: {...data_text.style} , x: pan.worldX, y: pan.worldY} )
        textId++
        texts = texts
        data_text.selectedText = texts[texts.length-1]
    }

    export function deleteText(text) {
        if (text == data_text.selectedText) data_text.selectedText = null
        let i = texts.indexOf(text)
        texts.splice(i, 1)
        texts = texts
    }

    /* Hacky as fuck, but updating the text size alone doesnt do it... */
    function getTextWidth(text): number {
        let tm = PIXI.TextMetrics.measureText(text.text, new PIXI.TextStyle(text.style))
        return tm.width
    }
    
    function getTextHeight(text): number {
        let tm = PIXI.TextMetrics.measureText(text.text, new PIXI.TextStyle(text.style))
        return tm.height
    }

</script>

{#each texts as t (t.id)}
    <Text 
        x={t.x}
        y={t.y}
        style={t.style}
        text={t.text}
        height={getTextHeight(t)}
        width={getTextWidth(t)}
        interactive={true}
        on:pointerover={e => hoveredText = t}
        on:pointerout={e => hoveredText = null}
    />

{/each}

<Graphics 
    draw={g => {
        g.clear()
        if (data_text.selectedText) {
            g.lineStyle(4, 0x333333)
            g.drawRect(data_text.selectedText.x-5, data_text.selectedText.y-5, getTextWidth(data_text.selectedText)+10, getTextHeight(data_text.selectedText)+10)
        }

        if (hoveredText && hoveredText != data_text.selectedText) {
            g.lineStyle(2, 0x555555)
            g.drawRect(hoveredText.x-4, hoveredText.y-4, getTextWidth(hoveredText)+8, getTextHeight(hoveredText)+8)
        }
    }}
/>
