import type { TerrainHexField } from '../types/terrain'
import type { Tile } from '../types/tilesets'

import {genHexId} from './hexHelpers'

import { DEFAULTTILESET } from './defaultTileset'

interface icon_set_data {
    display: string
    texId: string
    color: number
    pHex: number // percent of total hex taken up
    base64: string
}

interface saveData {
    saveVersion: number
    title: string

    TerrainField: TerrainHexField
    tilesets: {[key: string]: Tile[]}
    iconsets: {[key: string]: icon_set_data[]}
    paths: []
    texts: []
    icons: []
}

const CURRENTSAVEVERSION = 1

/*
const DEFAULTTILESET = [
    { display: "Plains", id: "default_plains", bgColor: 0xaee65c, symbol: null },
    { display: "Desert", id: "default_desert", bgColor: 0xffee44, symbol: null },
    { display: "Beach", id: "default_beach", bgColor: 0xf8fe9f, symbol: null },
    { display: "Deep Water", id: "default_deepwater", bgColor: 0x165b9c, symbol: null },
    { display: "Water", id: "default_water", bgColor: 0xb3e0f9, symbol: null },
    { display: "Tree", id: "default_tree", bgColor: 0x8cc63f, symbol: { texId: "default_tree", color: 0x3d7e25, texWidth: 100, texHeight: 100, pHex: 80, base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKVSURBVHhe7Z2LUsIwEEXBz9Lv199CV8kMlIKkZXfPJvfMdEBmSkpObl5WOZ5Op4Pg8HZ+FBAkBIaEwJAQGBICQ0JgSAiMzHXI3oKP58ehiE7I+89hIl7RCl71PigiE+JZ0DIta2WVSFRUQrytX77/vbLs9XZgGWlQ76lorJwIIZEfektZdo6NbQgixhBcK3xA+jijdcg16Y1HQm5JlSIh66RJiRAy5Irai6iEVJSSkpLILsuktOPDXhC3ZGwups9kOghPdvSgjlmAUYkSYqmw4/P3pzqENyCt1P8ntNvyTkh1GUZLd8hn8RQygowl7mK8hIwoI4ToWdYouDU4DyGzpMPlcyohMCQEhoTAkBAYHkLCN+RGwishkrIRzy7LpEhMJxFjSBMjOU8QNajbIkrbKU8QIUQiOvAWIhmdRHVZI+IyJnoKUTo2oIRsw23G6Pk79eoJSZmmKyEwPIVoIbgB74RISicRXZZJseMV9/P2Ct7aINIaUsa9vUZvoZcV1HOunbenrHCyhCy5dxFrldMrxHjmnFQRDYqQHrYIKYOmvTAkBIaEwJAQGBICo5qQclPCXpQQGBICo5KQ4bsrQwmBISEwJASGhMCoImSKAd1QQmBICAwJgVFByJ7xo9zYo4TAoAuZZnbVUEJgzCCkVMrIQqbrroxZuqwycqlCPCqwxH9Epd656HVR+DsZiQnxbCH4rosmJKLC0FJIQiIryspCiplllnUPnBSKkMyKQUkhCCFUiF0DQszsXdaSdDHZQhCtcoU0MUrIY8KlSMgttpq/PEIhbJ1kXwBqO4WQkNYSI74ozMpo5bUDBXVz0XZm93w9klX819/TWlT8O/Wh0aAOQ0JgSAgMCYEhITAkBIaEwJAQFIfDN2Shgz9c4BjXAAAAAElFTkSuQmCC" } },
    { display: "Fire Tree", id: "default_firetree", bgColor: 0xffee44, symbol: { texId: "default_tree", color: 0xaa4411, texWidth: 100, texHeight: 100, pHex: 80, base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKVSURBVHhe7Z2LUsIwEEXBz9Lv199CV8kMlIKkZXfPJvfMdEBmSkpObl5WOZ5Op4Pg8HZ+FBAkBIaEwJAQGBICQ0JgSAiMzHXI3oKP58ehiE7I+89hIl7RCl71PigiE+JZ0DIta2WVSFRUQrytX77/vbLs9XZgGWlQ76lorJwIIZEfektZdo6NbQgixhBcK3xA+jijdcg16Y1HQm5JlSIh66RJiRAy5Irai6iEVJSSkpLILsuktOPDXhC3ZGwups9kOghPdvSgjlmAUYkSYqmw4/P3pzqENyCt1P8ntNvyTkh1GUZLd8hn8RQygowl7mK8hIwoI4ToWdYouDU4DyGzpMPlcyohMCQEhoTAkBAYHkLCN+RGwishkrIRzy7LpEhMJxFjSBMjOU8QNajbIkrbKU8QIUQiOvAWIhmdRHVZI+IyJnoKUTo2oIRsw23G6Pk79eoJSZmmKyEwPIVoIbgB74RISicRXZZJseMV9/P2Ct7aINIaUsa9vUZvoZcV1HOunbenrHCyhCy5dxFrldMrxHjmnFQRDYqQHrYIKYOmvTAkBIaEwJAQGBICo5qQclPCXpQQGBICo5KQ4bsrQwmBISEwJASGhMCoImSKAd1QQmBICAwJgVFByJ7xo9zYo4TAoAuZZnbVUEJgzCCkVMrIQqbrroxZuqwycqlCPCqwxH9Epd656HVR+DsZiQnxbCH4rosmJKLC0FJIQiIryspCiplllnUPnBSKkMyKQUkhCCFUiF0DQszsXdaSdDHZQhCtcoU0MUrIY8KlSMgttpq/PEIhbJ1kXwBqO4WQkNYSI74ozMpo5bUDBXVz0XZm93w9klX819/TWlT8O/Wh0aAOQ0JgSAgMCYEhITAkBIaEwJAQFIfDN2Shgz9c4BjXAAAAAElFTkSuQmCC" } },
    { display: "Mountains", bgColor: 11759872, id: "default_mountains", symbol: { texId: "default_mountains", color: 0x422000, texWidth: 100, texHeight: 100, base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsSAAALEgHS3X78AAACdklEQVR4nO3b4VWzMBiGYXACR3CEjuAIdgNH6Ahu4AiOohvUTeoGj6cVj0ib8BJCSMh9nfP9+WwphaY3ENoAAAAAAAAAAAAAAAAA2ybpSdI9uzkDknaSTpLea98WqzuPCklH/XmpfJOsS9Kbrj3WvE1WI+n5xs5Q9/VFT1LqdcOFnqRyoxsu9CQFRzdc6MmSPN1woSdLMXSDnqQyoRsu9CSmid1woScxGLvxahhB9GQuYzcujZjyWAQwduPfp944muhJCGM3rroQ+jx4zPmkh4ws+HfG7BYs0ZNumbuq9l3MT3fMnvTW61jVyIr9/R9reYPlvM1+oyVY4ggpxohzrNfz1nfGYucQc5btee5psz1JcVQUMvoM67XNnqQ6b5j6OsbHb6snKc+sp4zEifMu2+jJGteejK95nDjvUn5P1jybDph1tCi7J2tfb4o0vzJUZk9yuCIbYQbSpaye5DRnETBH/9798ymnJzlehZ3Qk9+jr3vjQUH+Pcl1niLg/OTR8Pi8e5LzTJ5h5F6t1/n/DO8nz56UMNftWUfnehXZk5Jm726M4rGrwOX1pLT57cH6WuZJyulJiXeA9Ea0eb2K6EnJ90hJegh4Tr49qfGuj6x7Uut9UVn2pPY7B7PqCffW/siiJ9wt+CeLnnA/7X+r9qT2bris0hO64Ze0J3RjXNKe0A2bJD3pvqrG8EuljrEn4V9dkg4jC+e3fAOGnhx8z78bWf7XyN/2c9/ABu0N2y3MSKyq74aLpyfzD35uHPKeNv+7iQi687bhdhvtR2t96d6I+GzbNnzYVaQbDZed0LbtR+3bAwAAAAAAAAAAAAAAAACSa5rmG2xygv09oK+NAAAAAElFTkSuQmCC", pHex: 80 } },
    { display: "tree2", bgColor: 0x8cc63f, id: "default_tree2", symbol: { texId: "tree2", color: 0x3d7e25, base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsSAAALEgHS3X78AAADiUlEQVR4nO2d/W0bMQzFpaIDOBu0EySZoM4ETSaoM0HSCZxO4HYCtxO4Gzgb+DqBs4G9AQsBPOBg2PEHHnWU7v3+TUDp9I6UjqLkQAghhBBCCCGEEEIIIZcQaxg1EbkJIYxCCOM9f25CCNsY42sPXRsGIjISkYmILERkI6ezFJFnEfk09DGEkAZSROZninCIJM4+jyLHUI+YAUTYx1JDHjmF9BaDPOIYLxTkCGmQMgjRJXnLyPWg9IXOFX2woig79ChGC0Vp6SFMHYKiiMi9EzFa5rnHwM2Xur6Na/3i9sRDjPFvrv58cPTgU4diJGY5Q5cLQTSV8eygK/vI2jcvHjJ10If3eMrlJb0Log866bsfR0h9vM/RUK+CpFVVCCH7SuZCnnI0kn2VpfPFVN+40tb5VzHGrWUD2Tykzdjq0nZSoBjhwAYYlCyC6L7D2vFK6lTM0/Tmgmhae1moR+zyxbqBj5bGNfXgfQXlCrNJvVYxYoymCyGTkJUKEGr1DOsPRLjauj+9Qtt1RCorurNa/lp4SCkfepeSXjizrV6oIBqqhlDBkZ5xYWEY7SHek4RIxhaVKrA5RL2j9nC1j9sYY4MyhvSQr0BbJTFD9hXiITrBbRC2CuUOVcyN8pCh18h+QxlCCTL02ljY5hVKkGuQnVIZoSrpUYKwyg8Utj2VAZUOJEpQEByQKEFBnEFBnIES5K2aEekZlCD/ih0BZ6AEgSXXCgYyBhBBNI9jWkBWAJAogZzUs52hcIqr5GLiF9BWaTQxRsjCBiaIbtIM9T4R2MsIrTrRBNsSabMA0tz5GVWFAv0w1Mn9J9JmAfxAlgRZ1GWNtC5rCDfupLnjFmkQnjrRt+VhAMvg9HyPaKMmuSyd4OGddcZ3ZLVJi1lyUc921+opjzHG3xaGzY+0aa3vopI5ZaueYSJGyHXGUCf6ea6TrEY06hn15O30MrKlj2tMTmZT/eVmKsyldyeu9CJLa9baTtYCjt4vn9Gv+3Hn/N5NZ3+60bjdaDb1tc0ZJTHObOpKQ+Z1p422nqxt463TTi+hqdh7e88VxPooGgruqTuDgjiDgjiDgjiDgjiDgjiDgjiDgjiDgjiDgjiDgjiDgjiDgjijZEGqPJMyFEGKKbQoWZA/Z/zv0Cvz86DbucfY8HcLM6GXM78nyoY/iZcZFeVlR5i1/u4hb5gghBBCCBk8hBBCCKmFEMJ/M9N74oLh5I8AAAAASUVORK5CYII=", texWidth: 100, texHeight: 100, pHex: 85 } }
]*/

let DEFAULTSAVEDATA: saveData = {
    saveVersion: CURRENTSAVEVERSION,
    title: "",

    TerrainField: {
        hexWidth: 50,
        hexHeight: 45,
        orientation: 'flatTop',

        blankHexColor: 0xf2f2f2,
        
        grid: {stroke: 0x333333, thickness: 2, shown: true},

        hexes: {}
    },

    tilesets: {
        'default': DEFAULTTILESET
    },

    

    iconsets: {
        'default': [
            { display: "House", texId: "default_house", color: 0x000000, pHex: 80, base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAMOSURBVHhe7ZpdbtQwFIUTQEVF8ECXUzbDDlhHt9InNsFaWAJCQppeo7GUTmfyY1/b59jnk65S5aWJP5/reJL5dDpNAod356MAQULA6ElI6L30/bcXIUsRj+cjJT0s6tduYD4f6WBOSBct6hJWIVsiaNsWY8vae8GUbYstIUdmD2VKmBKScqF0KWFJSOqsoZltkV72Id3AICR3llOlBF0IXcvJZZSWRSMWWchw6QiMtKhTCEYVUmrw4KUgChmyVUVGalkRaOFoQmoNFqwUJCG1BwlSCoqQVoMD94swgpCWM/WXFZSU1kIQ2gaUlJZCkHo4jJRWQhAXVAgpLd4YIsq4pNmbxtoJYZARaHadNYWwyIg0ud5aQthkRKpfd2khYZFklRGputCXXtTZZSypstCXTEhPMgJVklJKSG8yAlX2KSVaVo8ylhRtXd4Jab7TrUDRCecpJMgIsR6BYlK8hIwkoyhea0jv68Yt3NcTj4SMKiPgfu+lHntHwlVKrpCR07HEbRxyhEjGa1zGI1XICPuNJqQ+ZSkdt8l68kpJiNKxTtZkTUmI0rGPpKQcTYhk7CdprHIfe8U6h6UcEaJ0VGCvEMlI59DYqWWBsUeI0pHP7jHcEqI9R2W29iFKhy+be5O1hCgd/mxO8LWEKB3luJkUPWW14eZkl5B2XJVy5MdFtbAyvGpfqe9DrjG6sKz3IBHPluVyQaPjvYaMKsXtvrWogyEhYEgIGBIChoSAISFgSAgYEgKGhIAhIWBICBgSAoaEgCEhYEgIGBIChoSAISFgSAgY7ELCu+xY38KJBrh+R+D5GVCkxudAW4NQ85MkVyG9tqyWicmCMSFHZyTa9azClpCUm3cdsNLoKQsMJiE5M50mJUoIGBKSj+tDA4sQqoU5h5ESQiGVQchpnudpWT3DsDH8YxI+nf/Owu615CbRZaaUEHJJ7j/4bfXD6qfVP6s7qwerD1ZB1Eerz1ZfrULi703gsx3fICEOHG1Rdj9BUJD2/v+Jafpr9cXqyep7OOGIe/+EFxLwWjfw73WaXgA0M6p+MsbyoAAAAABJRU5ErkJggg==" },
            { display: "Red Pillar", texId: "default_pillar", color: 0xff0000, pHex: 80, base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJeSURBVHhe7ZxhToNAGERbj6UX6JF7Ab1WZc2SoGkJW8vyZnZe0hT+KM3zm1kocr7dbqfA4a2+BwgRAiNCYEQIjAiBoSKkLAWHWA6qTYi9lEQWjAiBoSjEOrYUhAx1bSeRBUNViO3UyAm5Xq91y5NEFgy6kIfRNE3Ke920gv4F1a+DW8bV5XIpb+efHSMSWTAiBIa0EMceke2QgmOPJLJgkIWsTocrmRAYDkLQJdiK+iqrbvmQyIJhIcTpfIR8HrJ5leV0PkKdEKuibiEdAsNJiMVUuZR63dKHKGTY/iikQ2C4CZGfLhshLj2SyIJhJ0T9Mgrt0snDg9kaSeqXURJZMCIEBknIK7NTdvnrWOp1S5NEFowIgUERskfmS/aI5YQo90giCwZBiOwSdQ/cJ0ROtq0Q1R45WojlP27+h6OFfNb3UHHvEDmOFNKrcKWK3XpCFIs9kQXjKCE5GXxAJgTGKEJkJtJeiFqxHyEk/bFCOgRGhMDoLeTpuKp3JP4HiagcYkKUij2RBSNCYPQUkuXuBkabEPwfxTBCVIo9HQKjl5DczLCRXkJecjPDC04O8YwYWehiH0qIQrH3EJL+aKCHkNwM18CIHYJmVCHYYt9bCO6D04s9kQUjQmCMLATZI3sKwRYnuUcSWTCGFEK+SLnnA8x2+cHPxs2KBNTDzuyF/BGBf9LcnpFVPvz86k4RUV6TwI9p97DjaOWoZy4+/UvXJmQ5DUXEtP9Vd2UgPASz6QDuCVGLpTVknko6sxTiJGKGJmSm5aAsRMxQhSy5d4BWEpYoCBmKXDqBESEoTqdvi9ml8cBIeugAAAAASUVORK5CYII=" },
            { display: "Green Pillar", texId: "default_pillar", color: 0x00ff00, pHex: 80, base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJeSURBVHhe7ZxhToNAGERbj6UX6JF7Ab1WZc2SoGkJW8vyZnZe0hT+KM3zm1kocr7dbqfA4a2+BwgRAiNCYEQIjAiBoSKkLAWHWA6qTYi9lEQWjAiBoSjEOrYUhAx1bSeRBUNViO3UyAm5Xq91y5NEFgy6kIfRNE3Ke920gv4F1a+DW8bV5XIpb+efHSMSWTAiBIa0EMceke2QgmOPJLJgkIWsTocrmRAYDkLQJdiK+iqrbvmQyIJhIcTpfIR8HrJ5leV0PkKdEKuibiEdAsNJiMVUuZR63dKHKGTY/iikQ2C4CZGfLhshLj2SyIJhJ0T9Mgrt0snDg9kaSeqXURJZMCIEBknIK7NTdvnrWOp1S5NEFowIgUERskfmS/aI5YQo90giCwZBiOwSdQ/cJ0ROtq0Q1R45WojlP27+h6OFfNb3UHHvEDmOFNKrcKWK3XpCFIs9kQXjKCE5GXxAJgTGKEJkJtJeiFqxHyEk/bFCOgRGhMDoLeTpuKp3JP4HiagcYkKUij2RBSNCYPQUkuXuBkabEPwfxTBCVIo9HQKjl5DczLCRXkJecjPDC04O8YwYWehiH0qIQrH3EJL+aKCHkNwM18CIHYJmVCHYYt9bCO6D04s9kQUjQmCMLATZI3sKwRYnuUcSWTCGFEK+SLnnA8x2+cHPxs2KBNTDzuyF/BGBf9LcnpFVPvz86k4RUV6TwI9p97DjaOWoZy4+/UvXJmQ5DUXEtP9Vd2UgPASz6QDuCVGLpTVknko6sxTiJGKGJmSm5aAsRMxQhSy5d4BWEpYoCBmKXDqBESEoTqdvi9ml8cBIeugAAAAASUVORK5CYII=" },
            //{ display: "Green Pillar", id: "default_green_pillar", color: 0x00ff00, base64: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJeSURBVHhe7ZxhToNAGERbj6UX6JF7Ab1WZc2SoGkJW8vyZnZe0hT+KM3zm1kocr7dbqfA4a2+BwgRAiNCYEQIjAiBoSKkLAWHWA6qTYi9lEQWjAiBoSjEOrYUhAx1bSeRBUNViO3UyAm5Xq91y5NEFgy6kIfRNE3Ke920gv4F1a+DW8bV5XIpb+efHSMSWTAiBIa0EMceke2QgmOPJLJgkIWsTocrmRAYDkLQJdiK+iqrbvmQyIJhIcTpfIR8HrJ5leV0PkKdEKuibiEdAsNJiMVUuZR63dKHKGTY/iikQ2C4CZGfLhshLj2SyIJhJ0T9Mgrt0snDg9kaSeqXURJZMCIEBknIK7NTdvnrWOp1S5NEFowIgUERskfmS/aI5YQo90giCwZBiOwSdQ/cJ0ROtq0Q1R45WojlP27+h6OFfNb3UHHvEDmOFNKrcKWK3XpCFIs9kQXjKCE5GXxAJgTGKEJkJtJeiFqxHyEk/bFCOgRGhMDoLeTpuKp3JP4HiagcYkKUij2RBSNCYPQUkuXuBkabEPwfxTBCVIo9HQKjl5DczLCRXkJecjPDC04O8YwYWehiH0qIQrH3EJL+aKCHkNwM18CIHYJmVCHYYt9bCO6D04s9kQUjQmCMLATZI3sKwRYnuUcSWTCGFEK+SLnnA8x2+cHPxs2KBNTDzuyF/BGBf9LcnpFVPvz86k4RUV6TwI9p97DjaOWoZy4+/UvXJmQ5DUXEtP9Vd2UgPASz6QDuCVGLpTVknko6sxTiJGKGJmSm5aAsRMxQhSy5d4BWEpYoCBmKXDqBESEoTqdvi9ml8cBIeugAAAAASUVORK5CYII=" },
        ]
    },

    paths: [],
    icons: [],
    texts: [],
}

//console.log(JSON.stringify(DEFAULTSAVEDATA.tilesets['default']))

let hexesOut = 10;
for (let q = -hexesOut; q <= hexesOut; q++) {
    for (let r = -hexesOut; r <= hexesOut; r++) {

        if (-q - r >= -hexesOut && -q - r <= hexesOut) {

            DEFAULTSAVEDATA.TerrainField.hexes[ genHexId(q, r, -q - r) ] = { q: q, r: r, s: -q - r, bgColor: 0xf2f2f2, symbolId: null, symbol: null }

        }

    }
}

export default DEFAULTSAVEDATA;
export type {saveData}