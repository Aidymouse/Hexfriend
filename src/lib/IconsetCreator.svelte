<script lang="ts">
  import * as PIXI from 'pixi.js'
  import ColorInputPixi from '../components/ColorInputPixi.svelte'

  import { Pixi, Sprite, Graphics } from 'svelte-pixi'
  import { getHexPathRadius } from '../helpers/hexHelpers'

  import {download} from './download2'
  import { tick } from 'svelte';

  
  interface icon_button {
    display: string,
    buttonId: number,
    color: number,
    pHex: number,
    texHeight: number,
    texWidth: number,
    base64: string,
    file: any,
    preview: string
  }

  let app = new PIXI.Application({
    width: 300,
    height: 300,
    backgroundAlpha: 0
  });

  export let appState

  let iconButtons: icon_button[] = []
  let stIndex: number = -1
  let buttonId: number = 0 // Used internally in this component only to keep track of buttons

  let setName: string = "default"

  let newIconFiles = []

  let hexOrientation: "flatTop" | "pointyTop" = "flatTop"

  let importFiles = [];

  $: {
    if (stIndex >= 0) {
      iconButtons[stIndex].preview = generatePreview(iconButtons[stIndex]) 
    }
  }

  function getIconScale(iconButton: icon_button, radius: number = 150) {

    let h, w
    if (hexOrientation == "pointyTop") {
        h = radius * 2;
        w = Math.cos(Math.PI / 6) * radius * 2;

    } else {
        w = radius * 2;
        h = (radius / Math.tan(Math.PI / 6));

    }

    let scale
    if (w < h) {
      scale = w * iconButton.pHex / 100 / iconButton.texWidth
    } else {
      scale = h * iconButton.pHex / 100 / iconButton.texHeight;
    }

    return {x: scale, y: scale}
  }

  function importIconSet() {
    let importFile = importFiles[0]
    if (!importFile) return

    let r = new FileReader()
    
    r.readAsText(importFile)
    r.onload = eb => {
      let importSet = JSON.parse(eb.target.result)
      
      buttonId = 0;

      
      importSet.forEach(iconData => {
        // Get width and height
        app.loader.reset()
        app.loader.add("s", iconData.base64)
        app.loader.load(() => {

          let newButton: icon_button = {
            display: iconData.display,
            buttonId: buttonId,
            color: iconData.color,
            pHex: iconData.pHex,
            texWidth: app.loader.resources["s"].texture.width,
            texHeight: app.loader.resources["s"].texture.height,
            base64: iconData.base64,
            preview: iconData.preview,
            file: null,
          }

          iconButtons = [...iconButtons, newButton]
          iconButtons = iconButtons

          buttonId++
          
        })

      })

      iconButtons = iconButtons

    }
  }

  function exportIconSet() {
    let iconSetForExport = []

    iconButtons.forEach(ib => {
      let i = {
        display: ib.display,
        texId: setName + "_" + ib.display.replace(" ", "-"),
        color: ib.color,
        pHex: ib.pHex,
        base64: ib.base64,
        preview: ib.preview
      }

      iconSetForExport.push(i)
    })

    console.log(iconSetForExport)
    download(JSON.stringify(iconSetForExport), setName + ".hfis")
  }

  function readFileAsData(file) {
    return new Promise(function(resolve,reject){
        let fr = new FileReader();

        fr.onload = function(e){
            resolve(e.target.result);
        };

        fr.onerror = function(){
            reject(fr);
        };

        fr.readAsDataURL(file);
    });
  }

  async function newIcons(e) {
    if (!newIconFiles.length) return

    let readers = [];

    for(let i = 0;i < newIconFiles.length;i++){
        readers.push(readFileAsData(newIconFiles[i]));
    }

    Promise.all(readers).then(async (values) => {
        // Values will be an array that contains an item
        // with the text of every selected file
        // ["File1 Content", "File2 Content" ... "FileN Content"]

        values.forEach(async (v) => {
          let t = await PIXI.Texture.from(v)

          let iconName: string = newIconFiles[values.indexOf(v)].name
          iconName = iconName.substring(0, iconName.search(/\./)) // Remove the file extension (doesnt work if there's a period in the filename lol)

          let newButton: icon_button = {
            display: iconName,
            buttonId: buttonId,
            color: 0xffffff,
            pHex: 80,
            texHeight: t.height, 
            texWidth: t.width,
            base64: v,
            file: null, // Gets set in a mome
            preview: ""
          }
          newButton.preview = generatePreview(newButton)

          buttonId++

          iconButtons.push(newButton)
        })

        iconButtons = iconButtons
        await tick();

        e.target.value = "";
    });

  }

  function deleteIcon() {
    iconButtons.splice(stIndex, 1)
    stIndex = -1
    iconButtons = iconButtons
  }

  function generatePreview(icon: icon_button) {
    let s = new PIXI.Sprite( PIXI.Texture.from(icon.base64) )
    s.tint = icon.color
    return app.renderer.plugins.extract.base64(s)
  }

</script>

<main>

  <nav>

    <div id="set-controls">
    
      <button on:click={() => { appState = "normal" }}> Exit Iconset Creator </button>
    
      <input type="text" bind:value={setName}>
      <button on:click={ () => { exportIconSet() } }>Export</button>
      <button id="import-button">Import <input type="file" bind:files={importFiles} on:change={e => { importIconSet(); e.target.value = ""}}> </button>

    </div>

    <div id="icon-buttons">

      {#each iconButtons as b (b.buttonId) }
        <button on:click={ () => {stIndex = iconButtons.indexOf(b)} } class:selected={stIndex == iconButtons.indexOf(b)} title={b.display} > <img src={b.preview} alt={b.display}> </button>
      {/each}

      <button id="new-icon-button"> 
        +
        <input type="file" multiple bind:files={newIconFiles} on:change={async (e) => { newIcons(e) } } >
      </button>
    
    </div>
  
  </nav>

  {#if stIndex >= 0}
    <div id="icon-preview">

      <Pixi {app}>
        
        <Graphics
          draw={g => {
            g.clear();
            g.beginFill(0xf2f2f2);
            g.drawPolygon( getHexPathRadius(150, hexOrientation, 150, 150) );
            g.endFill();
          }}
        />

        <Sprite 
          texture={ PIXI.Texture.from( iconButtons[stIndex].base64 ) }
          tint={iconButtons[stIndex].color}
          x={150}
          y={150}
          anchor={ {x: 0.5, y: 0.5} }
          scale={ getIconScale(iconButtons[stIndex]) } 
        />

      </Pixi>

      <input type="text" bind:value={ iconButtons[stIndex].display }>
      <button on:click={() => {deleteIcon()} }>Delete</button>

    </div>

    <div id="icon-controls">

      <div style="width: 60px; height: 60px">
        <ColorInputPixi bind:value={iconButtons[stIndex].color} />
      </div>

      <input type="range" min="5" max="100" bind:value={iconButtons[stIndex].pHex}>

    </div>

  {:else}
    <div id={"editor-placeholder"}> <p>Create or select an icon to start!</p> <p class={"subtitle"}>Tip: You can select multiple files at once when you add an icon.</p> </div>
  
  {/if}

</main>




<style>

main {
  display: grid;
  grid-template-columns: 310px 1fr 1fr;
  height: 100%;
}


/* BUTTONS */
nav {
  background-color: #222222;
}

#set-controls {
  padding: 10px;
  box-sizing: border-box;
  background-color: #555555;
}

#icon-buttons {
  padding: 10px;
  box-sizing: border-box;
  
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(5, 50px);
  grid-template-rows: 50px;
  grid-auto-rows: 50px;
}

#icon-buttons button {
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;
}

#icon-buttons button img {
  width: 90%;
}

#new-icon-button {
  position: relative;
}

#new-icon-button input {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.selected {
  border-color: #8cc63f;
  outline: #8cc63f solid 1px;
}

#import-button {
  position: relative;
}

#import-button input {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0px;
  top: 0px;
  opacity: 0;
}


/* PREVIEW */
#icon-preview {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}



/* CONTROLS */
#icon-controls {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

#icon-controls input[type="range"] {
  width: 60%;
}





/* PLACEHOLDER */

#editor-placeholder {
  grid-column: 2/4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #f2f2f2;
}

#editor-placeholder p {
  margin: 0;
}

#editor-placeholder p.subtitle {
  margin: 0;
  margin-top: 5px;
  font-size: 10pt;
  color: #999999;
}

</style>