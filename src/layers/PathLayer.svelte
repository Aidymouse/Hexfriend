<script lang="ts">
	import type { path_data } from '../types/data';
	import type { pan_state } from '../types/panning';
	import type { path_layer_path } from '../types/path';
	import type { terrain_field } from '../types/terrain';
	import type { shortcut_data } from '../types/inputs';
	import type { tools } from '../types/toolData';

	// ENUMS
	import { hex_orientation } from '../types/terrain';

	// STORES
	import { data_path } from '../stores/data';

	import * as store_panning from '../stores/panning';
	import { tfield } from '../stores/tfield';
	
	import { store_inputs } from '../stores/inputs';
	import { store_selected_tool } from '../stores/tools';
	import { store_has_unsaved_changes } from '../stores/flags';
	
	import { coords_cubeToWorld, coords_worldToCube, cube_round } from '../helpers/hexHelpers';
	import { Vector } from '../lib/vector2d';
	import * as PIXI from 'pixi.js';
	import { DashLine } from 'pixi-dashed-line';
	
	import { afterUpdate, onMount } from 'svelte';

	let pan: pan_state;
	store_panning.store.subscribe((newPan) => {
		pan = newPan;
	});

	let selectedTool: tools;
	store_selected_tool.subscribe(t => selectedTool = t);

	export let paths: path_layer_path[] = [];
	export let cont_all_paths: PIXI.Container;

	let pathId: number = 0;

	function updatePathId() {
		paths.forEach((p) => (pathId = Math.max(pathId, p.id)));
		pathId++;
	}

	updatePathId();

	function appendPoint(path: path_layer_path, x: number, y: number) {
		if ($data_path.add_to == "end") {
			path.points = [...path.points, x, y];
			
		} else if ($data_path.add_to == "start") {
			path.points = [x, y, ...path.points];
		}

		paths = paths;
		$store_has_unsaved_changes = true;
	}

	export function pointerdown() {
		$data_path.contextPathId = null;

		if ($store_inputs.mouseDown[0]) {
			if ($data_path.selectedPath) {
				let pX = store_panning.curWorldX();
				let pY = store_panning.curWorldY();
				if ($data_path.snap) {
					let sP = getSnapPoint();
					pX = sP.x;
					pY = sP.y;
				}

				appendPoint($data_path.selectedPath, pX, pY);

			} else if ($data_path.hoveredPath && !$data_path.dontSelectPaths) {
				$data_path.selectedPath = paths[paths.indexOf($data_path.hoveredPath)];
				$data_path.style = { ...$data_path.selectedPath.style };
				$data_path.hoveredPath = null;

			} else {
				addNewPath();
			}
		}
	}

	export function remove_latest_point(path: path_layer_path) {
		if ($data_path.add_to == "end") {
			path.points.pop();
			path.points.pop();
		} else if ($data_path.add_to == "start") {
			path.points.splice(0, 2)
		}
		paths = paths;

		if (path.points.length == 0) deletePath(path);

		$store_has_unsaved_changes = true;
	}

	export function deletePath(path: path_layer_path) {
		$data_path.selectedPath = null;

		let pathIndex = paths.indexOf(path);
		paths.splice(pathIndex, 1);

		paths = paths;

		$store_has_unsaved_changes = true;
	}

	function getSnapPoint() {

		// Overlay a grid of smaller opposite orientation hexes and it lines up perfectly!

		let snap_grid_orientation = $tfield.orientation == hex_orientation.FLATTOP ? hex_orientation.POINTYTOP : hex_orientation.FLATTOP
		let snap_grid_hexWidth = ($tfield.hexWidth + $tfield.grid.gap) / ($tfield.orientation == hex_orientation.FLATTOP ? 2 : 1.5)
		let snap_grid_hexHeight = ($tfield.hexHeight + $tfield.grid.gap) / ($tfield.orientation == hex_orientation.FLATTOP ? 1.5 : 2)

		let snap_coords = coords_worldToCube(
			store_panning.curWorldX(),
			store_panning.curWorldY(),
			snap_grid_orientation,
			snap_grid_hexWidth,
			snap_grid_hexHeight,
			$tfield.grid.gap,
			)
			
		return coords_cubeToWorld(
			snap_coords.q,
			snap_coords.r,
			snap_coords.s,
			snap_grid_orientation,
			snap_grid_hexWidth,
			snap_grid_hexHeight,
			$tfield.grid.gap,
		)

	}

	function addNewPath() {
		let pX = store_panning.curWorldX();
		let pY = store_panning.curWorldY();

		if ($data_path.snap) {
			let snapPoint = getSnapPoint();
			pX = snapPoint.x;
			pY = snapPoint.y;
		}

		paths.push({
			id: pathId,
			style: { ...$data_path.style },
			points: [pX, pY],
			hitboxes: [],
			dashes: $data_path.dashed ? [...$data_path.dashes] : null });
		paths = paths;
		pathId++;
		$data_path.selectedPath = paths[paths.length - 1];
		$data_path.hoveredPath = null;
		//console.log(paths);

		$store_has_unsaved_changes = true;
	}

	function pathPointsToPoints(path: path_layer_path) {
		let points = [];
		for (let pI = 0; pI < path.points.length; pI += 2) {
			points.push(new Vector(path.points[pI], path.points[pI + 1]));
		}
		return points;
	}

	/* HIT AREA */
	function findHitArea(path: path_layer_path) {
		let boxWidth = 5 + path.style.width;

		if (path.points.length < 4)
			return new PIXI.Polygon([
				path.points[0] - boxWidth,
				path.points[1] - boxWidth,
				path.points[0] - boxWidth,
				path.points[1] + boxWidth,
				path.points[0] + boxWidth,
				path.points[1] + boxWidth,
				path.points[0] + boxWidth,
				path.points[1] - boxWidth,
			]);

		let pathPoints = pathPointsToPoints(path);

		// Add first point

		// 0 radians = straight right
		// PI/2 radians = straight down
		// PI radians = straight left
		// -PI/2 radians = straight up

		// Set up initial two prior points

		// Names need some cleaning up, but i'll handle that later. Use the draw functions to help!

		let newPolyPoints = [];
		let pointStack = [];

		let firstSeg = Vector.subtract(pathPoints[1], pathPoints[0]);
		let perpFirstSegDir = new Vector(firstSeg.y, -firstSeg.x).normalize();
		let firstPointLeft = Vector.add(pathPoints[0], Vector.multiply(perpFirstSegDir, boxWidth));
		let firstPointRight = Vector.add(pathPoints[0], Vector.multiply(perpFirstSegDir, -boxWidth));

		newPolyPoints.push(firstPointLeft);
		pointStack.push(firstPointRight);

		// Find points for corners
		for (let pI = 1; pI < pathPoints.length - 1; pI++) {
			let p1 = pathPoints[pI - 1];
			let p2 = pathPoints[pI];
			let p3 = pathPoints[pI + 1];

			let lineSeg1 = Vector.subtract(p2, p1);
			let lineSeg2 = Vector.subtract(p2, p3);

			let perpLine1Dir = new Vector(lineSeg1.y, -lineSeg1.x).normalize();
			let perpLine2Dir = new Vector(lineSeg2.y, -lineSeg2.x).normalize();

			let p1Left = Vector.add(p1, Vector.multiply(perpLine1Dir, boxWidth));
			let p1Right = Vector.add(p1, Vector.multiply(perpLine1Dir, -boxWidth));

			let p3Left = Vector.add(p3, Vector.multiply(perpLine2Dir, boxWidth));
			let p3Right = Vector.add(p3, Vector.multiply(perpLine2Dir, -boxWidth));

			// Find intersection Point between left lines
			let p1LeftLine = { start: p1Left, end: Vector.add(p1Left, Vector.multiply(lineSeg1, 5)) };
			let p3RightLine = { start: p3Right, end: Vector.add(p3Right, Vector.multiply(lineSeg2, 5)) };
			let newPointLeft = findIntersectionPoint(p1LeftLine, p3RightLine);

			let p1RightLine = { start: p1Right, end: Vector.add(p1Right, Vector.multiply(lineSeg1, 5)) };
			let p3LeftLine = { start: p3Left, end: Vector.add(p3Left, Vector.multiply(lineSeg2, 5)) };
			let newPointRight = findIntersectionPoint(p1RightLine, p3LeftLine);

			/* 
			
			g.lineStyle(2, 0x0000ff);
			g.moveTo(p1LeftLine.start.x, p1LeftLine.start.y)
			g.lineTo(p1LeftLine.end.x, p1LeftLine.end.y)
			
			g.lineStyle(2, 0x00ff00);
			g.moveTo(p3LeftLine.start.x, p3LeftLine.start.y)
			g.lineTo(p3LeftLine.end.x, p3LeftLine.end.y)
			
			*/

			/*
			g.lineStyle(2, 0x000088);
			g.moveTo(p1RightLine.start.x, p1RightLine.start.y)
			g.lineTo(p1RightLine.end.x, p1RightLine.end.y)
			
			g.lineStyle(2, 0x008800);
			g.moveTo(p3RightLine.start.x, p3RightLine.start.y)
			g.lineTo(p3RightLine.end.x, p3RightLine.end.y)
			*/

			newPolyPoints.push(newPointLeft);
			pointStack.push(newPointRight);
		}

		let lastPoint = pathPoints[pathPoints.length - 1];
		let secondLastPoint = pathPoints[pathPoints.length - 2];

		let lastSeg = Vector.subtract(lastPoint, secondLastPoint);
		let perpLastSegDir = new Vector(lastSeg.y, -lastSeg.x).normalize();
		let lastPointLeft = Vector.add(lastPoint, Vector.multiply(perpLastSegDir, boxWidth));
		let lastPointRight = Vector.add(lastPoint, Vector.multiply(perpLastSegDir, -boxWidth));

		newPolyPoints.push(lastPointLeft);
		pointStack.push(lastPointRight);

		while (pointStack.length > 0) {
			newPolyPoints.push(pointStack.pop());
		}

		let newPolyParse = [];
		newPolyPoints.forEach((point) => {
			if (point) newPolyParse.push(point.x, point.y);
		});

		let poly = new PIXI.Polygon(newPolyParse);
		/*
		g.lineStyle(3, 0xff0000);
		g.drawPolygon(poly)
		*/

		return poly;
	}

	function findIntersectionPoint(line1, line2) {
		// Check if none of the lines are of length 0
		if ((line1.start.x === line1.end.x && line1.start.y === line1.end.y) || (line2.start.x === line2.end.x && line2.start.y === line2.end.y)) {
			return false;
		}

		let denominator =
			(line2.end.y - line2.start.y) * (line1.end.x - line1.start.x) - (line2.end.x - line2.start.x) * (line1.end.y - line1.start.y);

		// Lines are parallel
		if (denominator === 0) {
			return false;
		}

		let ua =
			((line2.end.x - line2.start.x) * (line1.start.y - line2.start.y) - (line2.end.y - line2.start.y) * (line1.start.x - line2.start.x)) /
			denominator;
		let ub =
			((line1.end.x - line1.start.x) * (line1.start.y - line2.start.y) - (line1.end.y - line1.start.y) * (line1.start.x - line2.start.x)) /
			denominator;

		// is the intersection along the segments
		if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
			return false;
		}

		// Return a object with the x and y coordinates of the intersection
		let x = line1.start.x + ua * (line1.end.x - line1.start.x);
		let y = line1.start.y + ua * (line1.end.y - line1.start.y);

		return { x, y };
	}

	/* idk */
	export function moveAllPaths(xMod: number, yMod: number) {
		paths.forEach((path) => {
			for (let pI = 0; pI < path.points.length; pI += 2) {
				path.points[pI] += xMod;
				path.points[pI + 1] += yMod;
			}
		});

		paths = paths;
		$store_has_unsaved_changes = true;
	}

	/* KEYBOARD */
	export function handleKeyboardShortcut(shortcutData: shortcut_data) {
		switch (shortcutData.function) {
			case 'toggleSnap':
				$data_path.snap = !$data_path.snap
				break;

			case 'deleteLastPoint':
				if ($data_path.selectedPath) {
					remove_latest_point($data_path.selectedPath);
				}
				break;

			case 'deletePath':
				if ($data_path.selectedPath) {
					deletePath($data_path.selectedPath);
				}
				break;

			case 'deselect':
				$data_path.selectedPath = null;
				break;
		}
	}

	export function keydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'Shift':
				$data_path.dontSelectPaths = true;
				break;
		}
	}

	export function keyup(e: KeyboardEvent) {
		switch (e.key) {
			case 'Shift':
				$data_path.dontSelectPaths = false;
				break;
		}
	}

	const HOVEREDSELECTORSTYLE: PIXI.LineStyle = { width: 1, color: 0x555555 };
	const SELECTEDSELECTORSTYLE: PIXI.LineStyle = { width: 2, color: 0x333333 };

	let path_containers = {};
	let cont_pixi_paths = new PIXI.Container();
	let grph_hovered_path = new PIXI.Graphics();
	let grph_selected_path = new PIXI.Graphics();

	let dashed_lines = {}; // path id: dashed line object

	cont_all_paths.addChild(cont_pixi_paths, grph_hovered_path, grph_selected_path);

	afterUpdate(() => {

		if (!$data_path) return;

		if ($data_path.selectedPath) {
			$data_path.selectedPath.style = {...$data_path.style};
		}

		for (const [path_id, cont_path] of Object.entries(path_containers)) {
			cont_path.marked_for_death = true
		}

		// Update paths to match state
		for (const path of paths) {

			if (!path_containers[path.id]) {

				let cont_path = new PIXI.Container();
				cont_path.on('pointerover', () => { $data_path.hoveredPath = path; })
				cont_path.on('pointerout', () => { $data_path.hoveredPath = null; })
				
				let grph_path = new PIXI.Graphics();

				cont_path.addChild(grph_path)

				path_containers[path.id] = cont_path;
				cont_pixi_paths.addChild(cont_path)

			}

			// Handle dashed lines
			// Make dashed line object if needed
			if (path.style.dashed) {

				if (dashed_lines[path.id] != null) {
					delete dashed_lines[path.id]
				}

				let cont_path = path_containers[path.id]
				let grph_path = cont_path.children[0]
				dashed_lines[path.id] = new DashLine(grph_path, {
					dash: [path.style.dash_length, path.style.dash_gap]
				})

			}

			// Get rid of dashed line if not needed
			if (!path.style.dashed && dashed_lines[path.id] != null) {
				delete dashed_lines[path.id]
			}

			let cont_path = path_containers[path.id]
			cont_path.marked_for_death = false
			cont_path.interactive = selectedTool == 'path' && !$data_path.selectedPath
			cont_path.hitArea = findHitArea(path)

			let grph_path = cont_path.children[0]
			grph_path.clear();
			grph_path.lineStyle(path.style);

			let draw_on = grph_path
			if (dashed_lines[path.id]) draw_on = dashed_lines[path.id]

			draw_on.moveTo(path.points[0], path.points[1]);
			for (let pI = 0; pI < path.points.length; pI += 2) {
				draw_on.lineTo(path.points[pI], path.points[pI + 1]);
			}



		}

		for (const [path_id, cont_path] of Object.entries(path_containers)) {

			if (cont_path.marked_for_death) {
				cont_all_paths.removeChild(cont_path)
				cont_path.destroy()
				delete dashed_lines[path_id]
				delete path_containers[path_id]
			}
		}


		/* Selector Graphics */
		grph_selected_path.clear();
		if ($data_path.selectedPath) {
			grph_selected_path.lineStyle(SELECTEDSELECTORSTYLE);
			grph_selected_path.beginFill(0xf2f2f2);
			
			let points = $data_path.selectedPath.points
			
			for (let pI = 0; pI < points.length; pI += 2) {
				grph_selected_path.drawCircle(points[pI], points[pI + 1], 4);
			}
			
			grph_selected_path.beginFill(0x8cc63f);
			if ($data_path.add_to == "start") {
				grph_selected_path.drawCircle(points[0], points[1], 4);
			} else {
				grph_selected_path.drawCircle(points[points.length-2], points[points.length-1], 4);
			}

			grph_selected_path.endFill();
		}
		
		grph_hovered_path.clear();
		if ($data_path.hoveredPath && !$data_path.dontSelectPaths) {
			grph_hovered_path.lineStyle(HOVEREDSELECTORSTYLE);
			grph_hovered_path.beginFill(0xf2f2f2);
			for (let pI = 0; pI < $data_path.hoveredPath.points.length; pI += 2) {
				grph_hovered_path.drawCircle($data_path.hoveredPath.points[pI], $data_path.hoveredPath.points[pI + 1], 3);
			}
			grph_hovered_path.endFill();
		}
	})

	onMount(() => {
		grph_hovered_path.clear();
		grph_selected_path.clear();

		cont_all_paths.removeChildren(0);
		cont_pixi_paths = new PIXI.Container();
		cont_all_paths.addChild(cont_pixi_paths);
		cont_all_paths.addChild(grph_hovered_path);
		cont_all_paths.addChild(grph_selected_path);
	})

</script>
