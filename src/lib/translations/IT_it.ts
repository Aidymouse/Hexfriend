import { ScaleMode } from '../../helpers/imageSizing'
import { HexOrientation } from '../../types/terrain'
import type { Translation } from './types'

export const IT_it: Translation = {
  language: 'IT_it',
  save_indicator: 'Salvataggio...',

  general: {
    even: 'Pari',
    odd: 'Dispari',
    export: 'Esporta',
    import: 'Importa',
    reset: 'Reset',
    saved: 'Salva',
  },

  icons: {
    scale_mode: 'Modalità Scala',
    scale_mode_options: {
      [ScaleMode.RELATIVE]: 'Relativa',
      [ScaleMode.BYDIMENSION]: 'Per Dimensione',
    },
    scale_relative: 'Proporzione degli Hex',
    scale_bydimension: {
      width: 'Percentuale Larghezza',
      height: 'Percentuale Altezza',
    },
  },

  tools: {
    hex_paintbucket: 'Hex - Secchiello',
    hex_eraser: 'Hex - Cancella',
    hex_eyedropper: 'Hex - Contagocce',
    icon_drag: 'Trascina Icone',
    icon_erase: 'Cancella Icone',
    icon_snap: 'Snap Icone',
    icon_eyedropper: 'Contagocce Icone',
    path_snap: 'Snap Percorso',
    eraser_terrain: 'Cancella Terreno',
    eraser_icon: 'Cancella Icone',
  },

  terrain_panel: {
    terrain_color: 'Colore Terreno',
    symbol_color: 'Colore Simboli',
    rotate60_left: 'Ruota 60° sinistra',
    rotate60_right: 'Ruota 60° destra',
    support_warnings: {
      [HexOrientation.FLATTOP]: 'Questo set di tessere è stato creato per esagoni con la parte superiore piatta. Potrebbe non apparire corretto su questa mappa.',
      [HexOrientation.POINTYTOP]: 'Questo set di tessere è stato creato per esagoni a punta. Potrebbe non apparire corretto su questa mappa.',
    },
  },

  icon_panel: {
    icon_color: 'Colore Icone',
    rotate60_left: 'Ruota 60° sinistra',
    rotate60_right: 'Ruota 60° destra',
    support_warnings: {
      [HexOrientation.FLATTOP]: 'Questo set di tessere è stato creato per esagoni con la parte superiore piatta. Potrebbe non apparire corretto su questa mappa.',
      [HexOrientation.POINTYTOP]: 'Questo set di tessere è stato creato per esagoni a punta. Potrebbe non apparire corretto su questa mappa.',
    },
  },

  path_panel: {
    line_ends: 'Termina Percorso',
    corners: 'Curve',
    dashed_line: 'Tratteggio',

    filled: 'Riempi',
    fill_color: 'Colore Riempimento',
    fill_opacity: 'Opacità',
    fill_match_button: 'Abbina Colori',

    switch_end: 'Alterna Estremo',
    deselect: 'Deseleziona Percorso',
    remove_last: 'Cancella Ultimo Punto',
    delete_path: 'Cancella Percorso',

    save_current_style: 'Salva il corrente stile di Percorso',
    update_style_title: 'Aggiorna questo stile di Percorso allo stile corrente.',
    rename_path_style_prompt: 'Come vorresti chiamare questo stile di Percorso?',
    delete_path_style_prompt: 'Eliminare questo stile di Percorso?',
    update_style: 'Aggiorna stile',
    rename_style: 'Rinomina',
    duplicate_style: 'Duplica',
    delete_style: 'Elimina',
  },

  text_panel: {
    align_left: 'Allinea a Sinistra',
    align_center: 'Centrato',
    align_right: 'Allinea a Destra',
    outline: 'Bordo esterno',
    opacity: 'Opacità',
    delete_text: 'Cancella Testo selezionato',
    save_current_style: 'Salva il corrente stile di Testo',
    update_style_title: 'Aggiorna questo stile di Testo allo stile corrente.',
    update_style: 'Aggiorna stile',
    rename_style: 'Rinomina',
    duplicate_style: 'Duplica',
    delete_style: 'Elimina',
    rename_text_style_prompt: 'Come vorresti chiamare questo stile di Testo?',
    delete_text_style_prompt: 'Eliminare questo stile di Testo',

    annoyed_1: "Seriamente, gli serve un nome.",
    annoyed_2: "Vuoi mettere alla prova la mia pazienza?",
    annoyed_3: "Che ne dici di 'Continente'?",
    annoyed_4: "O 'Titolo'",
    annoyed_5: "O 'Baronia'! No... aspetta... questo l'abbiamo già usato.",
    annoyed_6: "Va bene, me ne vado mentre pensi a un nome.",
    annoyed_7: "Ci sei ancora?",
    annoyed_8: "Non posso aiutarti, non posso vedere la mappa!",
    annoyed_9: "Probabilmente perché questa finestra di dialogo è aperta.",
    annoyed_10: "Per favore, puoi semplicemente scegliere un nome?",
    annoyed_11: "Hai provato a inserire un nome vuoto 25 volte.",
    annoyed_12: "...",
    annoyed_13: "Bah.",
    annoyed_14: "...",
    annoyed_15: "*Ahem*",
    annoyed_16: "...",
    annoyed_17: "Okay, bene...",
    annoyed_18: "Me ne sto andando...",
    annoyed_19: "Ci vediamo.",
    annoyed_20: "",
    annoyed_21: "Lo sapevi che puoi accarezzarmi dal menu delle impostazioni??",
    annoyed_22: "Okay, ora vado davvero. Ciao. Se puoi, scegli un nome.",
    annoyed_23: "Ti voglio bene.",
  },

  eraser_panel: {
    erase_all_icons: 'Cancella tutte le Icone',
    erase_icons_confirmation: 'Vuoi veramente cancellare tutte le Icone?',
    erase_all_paths: 'Cancella tutti i Percorsi',
    erase_paths_confirmation: 'Vuoi veramente cancellare tutti i Percorsi?',
    erase_all_text: 'Cancella tutto il Testo',
    erase_text_confirmation: 'Vuoi veramente cancellare tutto il Testo?',
  },

  overlay_panel: {
    show: 'Mostra',
    opacity: 'Opacità',
    reset_scale: 'Reset Scala',
    reset_position: 'Reset Posizione',
    remove: 'Rimuovi Sovrapposizione',
    remove_confirmation: 'Rimuovi Sovrapposizione?',
  },

  // Settings

  settings: {
    map_title: 'Nome della Mappa',
    export_as: 'Esporta come...',
    exports: {
      png: 'PNG',
      scaled_png: 'PNG compresso',
      scale_request_dialog: 'Compresso di quale percentuale?',
      hexfriend: 'Hexfriend',
    },

    grid: {
      title: 'Griglia',
      show: 'Mostra Griglia',
      thickness: 'Spessore della Griglia',
      color: 'Colore della Griglia',
      large_hexes: {
        title: 'Esagoni grandi',
        size: 'Dimensione',
        color: 'Colore',
        outline_thickness: 'Spessore Bordo',
        horizontal_offset: 'Offset orizzontale',
        horizontal_offset_tooltip: 'Offset orizzontale',
        vertical_offset: 'Offset Verticale',
        vertical_offset_tooltip: 'Offset Verticale',
        encompasedges: 'Circonda limiti della mappa',
        large_raised_column: 'Rialzo colonna ingrandita',
        large_indented_row: 'Rientro riga ingrandita',
      },
    },

    hexes: {
      title: 'Esagoni',
      blank_color: 'Colore Esagono vuoto',
      blank_color_reset: 'Reset',
      orientation: 'Orientamento Esagoni',
      pointytop: `Punta verso l'alto`,
      flattop: 'Base piatta',
      raised_column: 'Colonna rialzata',
      indented_row: 'Riga rientrata',
      width: 'Larghezza Esagono',
      height: 'Altezza Esagono',
      size_by_radius: 'Dimensioni in base al raggio',
      radius_set: 'Digita raggio',
      gap: 'Margine',
      retain_position: 'Blocca posizione',
      retain_position_explanation:
        `Gli oggetti selezionati manterranno la loro posizione rispetto al centro dell'esagono quando gli esagoni vengono ridimensionati..`,
      retain_icons: 'Icone',
      retain_paths: 'Percorsi',
      retain_text: 'Testi',
      update_icon_scale: 'Aggiorna scala Icone',
      update_icon_scale_explanation:
        `Le Icone aggiorneranno la loro scala per adattarsi alla nuova dimensione dell'esagono al momento del ridimensionamento. ATTENZIONE: la scala viene calcolata in base alla dimensione selezionata al momento del posizionamento dell'Icona. Se hai ridimensionato degli esagoni con questa opzione disattivata, la dimensione dell'Icona potrebbe assumere valori inaspettati.`,
    },

    shape: {
      title: 'Forma e dimensione',
      disclaimer: 'Gli esagoni rimossi a seguito di una riduzione delle dimensioni della mappa vengono completamente cancellati.',
      mapshape: 'Forma della mappa',
      flower: 'Fiore',
      square: 'Quadrato',
      hexesout: 'Esagoni patendo dal centro',
      addtop: 'Aggiunti Sopra',
      addbottom: 'Aggiunti Sotto',
      addleft: 'Aggiungi a Sinistra',
      addright: 'Aggiunti a Destra',
      removetop: 'Rimuovi Sopra',
      removebottom: 'Rimuovi Sotto',
      removeleft: 'Rimuovi a Sinistra',
      removeright: 'Rimuovi a Destra',
      removehex: 'Rimuovi esagoni',
      addhex: 'Aggiungi esagoni',
    },

    coordinates: {
      title: 'Coordinate',
      disclaimer: `Le coordinate possono rallentare le modifiche alla mappa come l'aggiunta di esagoni o il cambio di orientamento.`,
      show: 'Mostra Coordinate',
      system: 'Sistema di Coordinate',
      systems: {
        colrow: 'Colonna, Riga',
        axial: 'Assiale',
        cube: 'Cubo',
        letternumber: 'Lettera, Numero',
      },
      text_labels: {
        color: 'Colore',
        size: 'Dimensione del Font',
        outline_color: 'Colore bordo',
        outline_thickness: 'Spessore bordo',
      },
      separator: 'Separatore',
      space: 'Spazio dal basso',
      offset: {
        row: 'Offset Riga',
        column: 'Offset Colonna',
        q: 'Q offset',
        r: 'R offset',
        s: 'S offset',
      },
    },

    overlay: {
      title: 'Immagine in sovrapposizione',
      load: 'Carica Immagine in sovrapposizione',
      replace: 'Sostituisci Immagine in sovrapposizione',
    },

    tilesets: {
      title: 'Set di Tessere',
      import: 'Importa Set di Tessere',
      builder: 'Crea Set di Tessere',
      already_loaded: "Hai già caricato questo Set di Tessere :)",
      make_copy_confirmation: 'Hai già caricato un Set con questo ID. Vuoi importarne una copia?',
      remove_confirmation: 'Questa operazione rimuoverà tutte le Tessere in uso da questo Set. Continuare?',
    },

    icon_sets: {
      title: 'Set di Icone',
      import: 'Importa Set di Icone',
      builder: 'Crea Set di tessere',
      already_loaded: "Hai già caricato questo Set di Icone :)",
      make_copy_confirmation: 'Hai già caricato un Set con questo ID. Vuoi importarne una copia?',
      remove_confirmation: 'Questa operazione rimuoverà tutte le Icone in uso da questo Set. Continuare?',
    },

    generators: {
      title: 'Generatore',
      terrain: 'Generatore di Terreni',
      icon: 'Generatore di Icone',
    },

    changelog: 'Changelog',

    about: {
      title: 'About',
      version: 'versione',
      version_tagline: '"Hexfriend through time"', // It's advised you make this one funny little line for this language, that way you don't have to come back and change it for every version. Maybe a hexagon pun or something?

      // These messages are stiched together with a link in the middle in the form start + link + end
      credits: {
        start: 'Da Aidymouse e tutti i fantastici',
        contributorlink: 'collaboratori',
        end: '',
      },
      wiki: {
        start: 'Scopri di più sulle funzionalità avanzate di Hexfriends',
        wiki_link_text: 'sulla Wiki',
        end: '',
      },
      guts: {
        start: `Hexfriend è realizzato con Svelte, Pixi JS e Typescript. Dai un'occhiata su `,
        github_link: 'Github',
        end: '',
      },
      socials: {
        start: 'Hai trovato un bug? Hai delle idee? Vieni a salutarci su ',
        discord_link: 'Hexfriend Discord',
        end: '',
      },
      money: {
        start: 'Ti piace Hexfriend? Puoi donare i tuoi soldi guadagnati con fatica su ',
        kofi_link: 'Ko-fi.',
        end: '',
      },
    },
  },

  builders: {
    author: 'Autore',
    author_placeholder: 'Aidymouse e i collaboratori su Github, 7ede per la traduzione Italiana.',
    version: 'Version',
    change_orientation: 'Cambia orientamento degli Esagoni',
    duplicate: 'Duplica questo Esagono',
    supported_orientations: 'Supporto',
    supported_orientations_options: {
      [HexOrientation.FLATTOP]: 'Base piatta',
      [HexOrientation.POINTYTOP]: `Punta verso l'alto`,
      both: 'Entrambi',
    },
    rotation: 'Rotazione',

    tileset_builder: {
      import_tileset: 'Importa Set di Tessere',
      export_tileset: 'Esporta Set di Tessere',
      delete: 'Cancella questo Esagono',
      exit: 'Esci dallo strumento di Crezione Set di Tessere',
      name: 'Nome del Set di Tessere',
      name_placeholder: 'Nuovo Set di Tessere',
      helptext: 'Seleziona una Tessera o creane una nuova!',
      helpsubtitle: 'Per ottenere risultati ottimali, per i simboli utilizzare immagini bianche di 100x100 pixel.',
      background: 'Sfondo',
      upload_symbol: 'Carica Simbolo',
      replace_symbol: 'Sostituisci Simbolo',
      remove_symbol: 'Cancella Simbolo',
      symbol: 'Simbolo',
      scale: 'Scala del Simbolo',
    },
    icon_set_builder: {
      import_iconset: 'Importa Set di Icone',
      export_iconset: 'Estporta Set di Icone',
      delete: 'Cancella questa Icona',
      exit: 'Esci dallo strumento di Creazione Set di Icone',
      name: 'Nome del Set di Icone',
      name_placeholder: 'Nuovo Set di Icone',
      version: 'Versione',
      helptext: 'Scegli una Icona o creane una nuova!',
      helpsubtitle: 'Per ottenere risultati ottimali, utilizzare immagini bianche di 100x100 pixel..',
      helpsubsubtitle: 'Suggerimento: è possibile caricare più immagini contemporaneamente.!',
      help_wiki_mention: 'Ulteriori informazioni sono disponibili sulla wiki.',
      tint: 'Tinta',
      scale: 'Scale delle Icone',
    },
  },

  generators: {
    animate: 'Animazione',
    generate: 'Genera',
    close: 'Chiudi',
    clear: 'Pulisci',
    seed: 'Seme',
    seed_generation: 'Genera Seme',
    clear_confirmation: 'Pulire le regole di generazione?',
    clear_before_generation: 'Pulire prima di generare',
    icon_generator: {
      place_in_center: 'Posiziona nel centro degli Esagoni',
      generation_chance: 'Probabilità di generazione',
      out_of_connector: 'su',
      icon_scale: 'Scala',
    },
    terrain_generator: {
      preset: 'Preset',
    },
  },
  preview_hex_controls: {
    color: 'Colore',
  },
}
