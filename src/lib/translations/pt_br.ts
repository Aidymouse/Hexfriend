export const pt_br = {
	language: "pt_br",
	save_indicator: "Salvando...",

	general: {
		odd: "PLACEHOLDER",
		even: "PLACEHOLDER",
		export: "Exportar",
		import: "Importar",
		reset: "Redefinir",
	},

	tools: {
		hex_paintbucket: "Balde de Tinta de Hex",
		hex_eraser: "Apagar Hex",
		hex_eyedropper: "Conta gotas de Hex",
		icon_drag: "Arrastar Ícones",
		icon_erase: "Apagar Ícones",
		icon_snap: "Atrair Ícones para as Bordas",
		icon_eyedropper: "Conta gotas de Ícones",
		path_snap: "Atrair Pontos de Caminho para as Bordas",
		eraser_terrain: "Apagar Terreno",
		eraser_icon: "Apagar Ícones",
	},
	
	terrain_panel: {
		terrain_color: "Cor do Terreno",
		symbol_color: "Cor do Símbolo",
	},

	icon_panel: {
		icon_color: "Cor do Ícone",	
	},

	path_panel: {
		line_ends: "Fim da Linha",
		corners: "Cantos",
		dashed_line: "Linha Tracejada",

		switch_end: "Troca a Ponta",
		deselect: "De-selecionar a Linha",
		remove_last: "Remover Último Ponto",
		delete_path: "Apagar o Linha",

		save_current_style: "Salvar o estilo de Linha atual",
		update_style_title: "Atualizar o estilo da linha para corresponder ao que está configurado acima.",
		update_style: "Atualizar o Estilo",
		rename_style: "Renomear",
		duplicate_style: "Duplicar",
		delete_style: "Apagar",
	},

	text_panel: {
		align_left: "Alinhar à Esquerda",
		align_center: "Alinhar ao Centro",
		align_right: "Alinhar à Direita",
		outline: "Contorno",
		opacity: "Opacidade",
		delete_text: "Apagar o Texto Selecionado",
		save_current_style: "Salvar o estilo de texto atual",
		update_style_title: "Atualizar este estilo de linha para corresponder ao que está configurado acima.",
		update_style: "Atualizar Estilo",
		rename_style: "Renomear",
		duplicate_style: "Duplicar",
		delete_style: "Apagar",
	},

	eraser_panel: {
		erase_all_icons: "Apagar Todos os Ícones",
		erase_icons_confirmation: "Realmente quer apagar todos os ícones?",
		erase_all_paths: "Apagar Todas as Linhas",
		erase_paths_confirmation: "Realmente quer Apagar Todas as Linhas?",
		erase_all_text: "Apagar Todo o Texto",
		erase_text_confirmation: "Realmente Quer Apagar Todo o Texto?",
	},

	overlay_panel: {
		show: "Mostrar",
		opacity: "Opacidade",
		reset_scale: "Redefinir escala",
		reset_position: "Redefinir posição",
		remove: "Remover a Sobreposição",
		remove_confirmation: "Remover a Sobreposição?",
	},

	// Settings

	settings: {
		map_title: "Título do Mapa",
		export_as: "Exportar Como...",
		exports: {
			png: "PNG",
			scaled_png: "PLACEHOLDER",
			scale_request_dialog: "PLACEHOLDER",
			hexfriend: "Hexfriend",
		},

		grid: {
			title: "Grade",
			show: "Mostrar Grade",
			thickness: "Espessura da Grade",
			color: "Cor da Grade",
			gap: "Lacuna",
			large_hexes: {
				title: "Hexágonos Grandes",
				size: "Tamanho",
				color: "Cor",
				outline_thickness: "PLACEHOLDER",
				horizontal_offset: "Deslocamento Horizontal",
				horizontal_offset_tooltip: "PLACEHOLDER",
				vertical_offset: "Deslocamento Vertical",
				vertical_offset_tooltip: "PLACEHOLDER",
				encompasedges: "Abranger as Bordas do Mapa",
				large_raised_column: "PLACEHOLDER",
				large_indented_row: "PLACEHOLDER",
			},
		},
		
		hexes: {
			title: "Hexágonos (Hex)",
			blank_color: "Cor de Fundo Hexadecimal",
			blank_color_reset: "Redefinir",
			orientation: "Orientação do Hex",
			pointytop: "Topo Pontudo",
			flattop: "Topo Reto",
			raised_column: "PLACEHOLDER",
			indented_row: "PLACEHOLDER",
			width: "Largura do Hex",
			height: "Altura do Hex",
			size_by_radius: "Tamaho por Raio",
			radius_set: "Definir",
			retain_position: "Manter Posição",
			retain_position_explanation: "Os objetos selecionados tentarão permanecer em seu hexagono quando forem redimensionados",
			retain_icons: "Ícones",
			retain_paths: "Linhas",
			retain_text: "Texto",
		},
		
		shape: {
			title: "Forma e Tamanho",
			disclaimer: "Hexágonos removidos por uma redução no tamanho do mapa são completamente apagados.",
			mapshape: "Formato do Mapa",
			flower: "Flor",
			square: "Quadrado",
			hexesout: "Hexes à partir do centro",
			addtop: "Adicionar em Cima",
			addbottom: "Adicionar em Baixo",
			addleft: "Adicionar à Esquerda",
			addright: "Adicionar à Direita",
			removetop: "Remover de Cima",
			removebottom: "Remover de Baixo",
			removeleft: "Remover da Esquerda",
			removeright: "Remover da Direita",
			removehex: "Remover Hex",
			addhex: "Adicionar Hex",
		},

		coordinates: {
			title: "Coordenadas",
			disclaimer: "As coordenadas podem deixar as alterações no mapa mais lentas, como adicionar hexágonos ou alterar a orientação.",
			show: "Mostrar coordenadas",
			system: "Sistema de Cordenadas",
			systems: {
				colrow: "Coluna, Linha",
				axial: "Axial",
				cube: "Cubo",
				letternumber: "Letra e Número",
			},
			text_labels: {
				color: "Cor",
				size: "Tamanho da Fonte",
				outline_color: "Cor do Contorno",
				outline_thickness: "Espessura do Contorno"
			},
			separator: "Separador",
			space: "Distânicia da Parte Inferior",
			offset: {
				row: "Deslocamento da Linha",
				column: "Deslocamento da Coluna",
				q: "Deslocamento da Q",
				r: "Deslocamento da R",
				s: "Deslocamento da S"
			},
		},

		overlay: {
			title: "Sobreposição",
			load: "Carregar Imagem de Sobreposição",
			replace: "Substituir Imagem de Sobreposição",
		},

		tilesets: {
			title: "Conjuntos de Hexágonos (Tileset)",
			import: "Importar Conjunto",
			builder: "Construir um Conjunto",
			already_loaded: "PLACEHOLDER",
			remove_confirmation: "PLACEHOLDER",
		},
		
		icon_sets: {
			title: "Conjunto de Ícones",
			import: "Importar Conjunto de Ícones",
			builder: "Construir Conjunto de Ícones",
			already_loaded: "PLACEHOLDER",
		},


		generators: {
			title: "Geradores",
			terrain: "Gerador de Terreno",
			icon: "Gerador de Ícones",
		},


		changelog: "Registro de Alterações",

		about: {
			title: "Sobre",
			version: "versão",
			version_tagline: "\"Crie Mundos Hex-traordinários com Hexfriend!\"", // It's advised you make this one funny little line for this language, that way you don't have to come back and change it for every version. Maybe a hexagon pun or something?
			
			// These messages are stiched together with a link in the middle in the form start + link + end
			credits: { 
				start: "Por Aidymouse e todos os maravilhos",
				contributorlink: "contribuidores",
				end: ""
			},
			guts: {
				start: "Hexfriend foi feito com Svelte, Pixi JS e Typescript. Dé uma olhada no ",
				github_link: "Github",
				end: ""
			},
			socials: {
				start: "Achou um bug? Tem ideias? Dë um Oi no ",
				discord_link: "Discord do Hexfriend",
				end: ""
			},
			money: {
				start: "Você pode doar seu dinheiro suado em ",
				kofi_link: "Ko-fi.",
				end: ""
			},
		},

	},


	builders: {

		author: "Autor",
		author_placeholder: "Você!",
		version: "Versão",
		change_orientation: "Alterar Orientação do Hex",
		duplicate: "Duplicar este Hex",
		tileset_builder: {
			delete: "Apagar este Hex",
			exit: "Sair do Construtor de Conjuntos de Hexágonos",
			name: "Nome do Conjunto de Hexánogos",
			name_placeholder: "Nome do Conjunto",
			helptext: "Selecione uma peça ou crie uma nova!",
			helpsubtitle: "Para obter melhores resultados, use imagens brancas de 100 x 100 pixels para símbolos.",
			background: "Fundo",
			upload_symbol: "Carregar Símbolo",
			symbol: "Símbolo",
			symbol_scale: "Escala dos Símbolos",
		},
		icon_set_builder: {
			delete: "Apagar este Ícone",
			exit: "Sair do Construtor de Conjunto de Ícones",
			name: "Nome do Conjunto de Ícones",
			name_placeholder: "Novo Conjunto de Ícones",
			author: "Autor",
			version: "Versão",
			helptext: "Selecione um ícone ou crie um novo!",
			helpsubtitle: "Para obter melhores resultados, use imagens brancas de 100 x 100 pixels.",
			helpsubsubtitle: "Dica: você pode fazer upload de várias imagens de uma vez!",
			tint: "Matiz",
			scale: "Escala de Ícone",
		}
	},

	generators: {
		animate: "Animação",
		generate: "Gerar",
		close: "Fechar",
		clear: "Limpar",
		seed: "PLACEHOLDER",
		seed_generation: "PLACEHOLDER",
		clear_confirmation: "PLACEHOLDER",
		clear_before_generation: "Limpar Antes de Gerar",
		icon_generator: {
			place_in_center: "Colocar no Centro do Hex",
			generation_chance: "Chance da Geração",
			out_of_connector: "em",
			icon_scale: "PLACEHOLDER",
		},
		terrain_generator: {
			preset: "Predefinição",
		}
	},



}
