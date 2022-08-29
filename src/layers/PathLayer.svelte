<script lang="ts">
	import { coords_cubeToWorld, coords_worldToCube, cube_round } from '../helpers/hexHelpers';
	import type { path_data } from '../types/data';
	import type { path_layer_path } from '../types/path';
	import type { terrain_field } from '../types/terrain';
	import * as PIXI from 'pixi.js';
	import { Container, Graphics } from 'svelte-pixi';
	import type { tools } from 'src/types/toolData';

	import * as store_tfield from '../stores/tfield';
	import * as store_panning from '../stores/panning';
	import type { pan_state } from '../types/panning';
	import { Vector } from '../lib/vector2d';
	import type { shortcut_data } from 'src/types/inputs';
	
	export let controls;
	let pan: pan_state;
	store_panning.store.subscribe((newPan) => {
		pan = newPan;
	});

	export let selectedTool: tools;

	let tfield: terrain_field;
	store_tfield.store.subscribe(newTField => {
		tfield = newTField
	})
	
	export let data_path: path_data;

	export let paths: path_layer_path[] = [];

	let pathId: number = 0;

	function updatePathId() {
		paths.forEach((p) => (pathId = Math.max(pathId, p.id)));
		pathId++;
	}

	updatePathId()


	function appendPoint(path: path_layer_path, x: number, y: number) {
		path.points = [...path.points, x, y];
		paths = paths;
	}

	export function pointerdown() {
		data_path.contextPathId = null;

		if (controls.mouseDown[0]) {
			if (data_path.selectedPath) {
				let pX = store_panning.curWorldX();
				let pY = store_panning.curWorldY();
				if (data_path.snap) {
					let sP = getSnapPoint();
					pX = sP.x;
					pY = sP.y;
				}

				appendPoint(data_path.selectedPath, pX, pY);

			} else if (data_path.hoveredPath && !data_path.dontSelectPaths) {
				data_path.selectedPath = paths[paths.indexOf(data_path.hoveredPath)];
				data_path.style = { ...data_path.selectedPath.style };
				data_path.hoveredPath = null;

			} else {
				addNewPath();
			}
		}
	}

	export function removeLastPoint(path: path_layer_path) {
		path.points.pop();
		path.points.pop();
		paths = paths;

		if (path.points.length == 0) deletePath(path);
	}

	export function deletePath(path: path_layer_path) {
		data_path.selectedPath = null;

		let pathIndex = paths.indexOf(path);
		paths.splice(pathIndex, 1);

		paths = paths;
	}

	function getSnapPoint() {
		let hW = tfield.hexWidth;
		let hH = tfield.hexHeight;

		let clickedCoords = coords_worldToCube(store_panning.curWorldX(), store_panning.curWorldY(), tfield.orientation, tfield.hexWidth, tfield.hexHeight);
		let centerCoords = coords_cubeToWorld(
			clickedCoords.q,
			clickedCoords.r,
			clickedCoords.s,
			tfield.orientation,
			tfield.hexWidth,
			tfield.hexHeight
		);

		let closestPoint = { x: Infinity, y: Infinity };
		let shortestDist = Infinity;

		let snapPoints;

		if (tfield.orientation == 'flatTop') {
			snapPoints = [
				centerCoords,
				{ x: centerCoords.x + hW / 4, y: centerCoords.y - hH / 2 },
				{ x: centerCoords.x + hW / 2, y: centerCoords.y },
				{ x: centerCoords.x + hW / 4, y: centerCoords.y + hH / 2 },
				{ x: centerCoords.x - hW / 4, y: centerCoords.y + hH / 2 },
				{ x: centerCoords.x - hW / 2, y: centerCoords.y },
				{ x: centerCoords.x - hW / 4, y: centerCoords.y - hH / 2 },
			];
		} else if (tfield.orientation == 'pointyTop') {
			snapPoints = [
				centerCoords,
				{ x: centerCoords.x, y: centerCoords.y - hH / 2 },
				{ x: centerCoords.x + hW / 2, y: centerCoords.y - hH / 4 },
				{ x: centerCoords.x + hW / 2, y: centerCoords.y + hH / 4 },
				{ x: centerCoords.x, y: centerCoords.y },
				{ x: centerCoords.x - hW / 2, y: centerCoords.y + hH / 4 },
				{ x: centerCoords.x - hW / 2, y: centerCoords.y + hH / 4 },
			];
		}

		snapPoints.forEach((p) => {
			let dist = Math.sqrt((p.x - store_panning.curWorldX()) ** 2 + (p.y - store_panning.curWorldY()) ** 2);
			if (dist < shortestDist) {
				closestPoint = p;
				shortestDist = dist;
			}
		});

		return closestPoint;
	}

	function addNewPath() {
		let pX = store_panning.curWorldX();
		let pY = store_panning.curWorldY();

		if (data_path.snap) {
			let snapPoint = getSnapPoint();
			pX = snapPoint.x;
			pY = snapPoint.y;
		}

		paths.push({ id: pathId, style: { ...data_path.style }, points: [pX, pY], hitboxes: [] });
		paths = paths;
		pathId++;
		data_path.selectedPath = paths[paths.length - 1];
		data_path.hoveredPath = null;
		//console.log(paths);
	}


	function pathPointsToPoints(path: path_layer_path) {
		let points = [];
		for (let pI = 0; pI < path.points.length; pI += 2) {
			points.push( new Vector(path.points[pI], path.points[pI+1]) );
		}
		return points;
	}


	function findHitArea(path: path_layer_path) {
		let boxWidth = 5 + path.style.width;
		
		if (path.points.length < 4) return new PIXI.Polygon([
			path.points[0]-boxWidth, path.points[1]-boxWidth,
			path.points[0]-boxWidth, path.points[1]+boxWidth,
			path.points[0]+boxWidth, path.points[1]+boxWidth,
			path.points[0]+boxWidth, path.points[1]-boxWidth,
		])


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

		let firstSeg = Vector.subtract(pathPoints[1], pathPoints[0])
		let perpFirstSegDir = new Vector(firstSeg.y, -firstSeg.x).normalize()
		let firstPointLeft = Vector.add(pathPoints[0], Vector.multiply(perpFirstSegDir, boxWidth))
		let firstPointRight = Vector.add(pathPoints[0], Vector.multiply(perpFirstSegDir, -boxWidth))

		newPolyPoints.push(firstPointLeft)
		pointStack.push(firstPointRight)


		// Find points for corners
		for (let pI = 1; pI < pathPoints.length-1; pI++) {
			let p1 = pathPoints[pI-1]
			let p2 = pathPoints[pI]
			let p3 = pathPoints[pI+1]

			let lineSeg1 = Vector.subtract(p2, p1)
			let lineSeg2 = Vector.subtract(p2, p3)

			let perpLine1Dir = new Vector(lineSeg1.y, -lineSeg1.x).normalize();
			let perpLine2Dir = new Vector(lineSeg2.y, -lineSeg2.x).normalize();

			let p1Left = Vector.add(p1, Vector.multiply(perpLine1Dir, boxWidth))
			let p1Right = Vector.add(p1, Vector.multiply(perpLine1Dir, -boxWidth))

			let p3Left = Vector.add(p3, Vector.multiply(perpLine2Dir, boxWidth))
			let p3Right = Vector.add(p3, Vector.multiply(perpLine2Dir, -boxWidth))
		


			// Find intersection Point between left lines
			let p1LeftLine = {start: p1Left, end: Vector.add(p1Left, Vector.multiply(lineSeg1, 5))}
			let p3RightLine = {start: p3Right, end: Vector.add(p3Right, Vector.multiply(lineSeg2, 5))}
			let newPointLeft = findIntersectionPoint(p1LeftLine, p3RightLine)

			let p1RightLine = {start: p1Right, end: Vector.add(p1Right, Vector.multiply(lineSeg1, 5))}
			let p3LeftLine = {start: p3Left, end: Vector.add(p3Left, Vector.multiply(lineSeg2, 5))}
			let newPointRight = findIntersectionPoint(p1RightLine, p3LeftLine)
			
			
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

			newPolyPoints.push(newPointLeft)
			pointStack.push(newPointRight)

			

		}
		
		let lastPoint = pathPoints[pathPoints.length-1]
		let secondLastPoint = pathPoints[pathPoints.length-2]

		let lastSeg = Vector.subtract(lastPoint, secondLastPoint)
		let perpLastSegDir = new Vector(lastSeg.y, -lastSeg.x).normalize()
		let lastPointLeft = Vector.add(lastPoint, Vector.multiply(perpLastSegDir, boxWidth))
		let lastPointRight = Vector.add(lastPoint, Vector.multiply(perpLastSegDir, -boxWidth))

		newPolyPoints.push(lastPointLeft)
		pointStack.push(lastPointRight)

		while (pointStack.length > 0) {
			newPolyPoints.push( pointStack.pop() )
		}

		let newPolyParse = [];
		newPolyPoints.forEach(point => {
			if (point) newPolyParse.push(point.x, point.y)
		})

		let poly = new PIXI.Polygon(newPolyParse);
		/*
		g.lineStyle(3, 0xff0000);
		g.drawPolygon(poly)
		*/

		return poly;
	}

	function findIntersectionPoint(line1, line2) {
		// Check if none of the lines are of length 0
		if ((line1.start.x === line1.end.x && line1.start.y === line1.end.y) 
		|| (line2.start.x === line2.end.x && line2.start.y === line2.end.y)) {
			return false
		}

		let denominator = ((line2.end.y - line2.start.y) * (line1.end.x - line1.start.x) - (line2.end.x - line2.start.x) * (line1.end.y - line1.start.y))

		// Lines are parallel
		if (denominator === 0) {
			return false
		}

		let ua = ((line2.end.x - line2.start.x) * (line1.start.y - line2.start.y) - (line2.end.y - line2.start.y) * (line1.start.x - line2.start.x)) / denominator
		let ub = ((line1.end.x - line1.start.x) * (line1.start.y - line2.start.y) - (line1.end.y - line1.start.y) * (line1.start.x - line2.start.x)) / denominator

		// is the intersection along the segments
		if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
			return false
		}

		// Return a object with the x and y coordinates of the intersection
		let x = line1.start.x + ua * (line1.end.x - line1.start.x)
		let y = line1.start.y + ua * (line1.end.y - line1.start.y)

		return {x, y}

	}
	

	export function moveAllPaths(xMod: number, yMod: number) {
		paths.forEach((path) => {
			for (let pI = 0; pI < path.points.length; pI += 2) {
				path.points[pI] += xMod;
				path.points[pI + 1] += yMod;
			}
		});

		paths = paths;
	}


	export function handleKeyboardShortcut(shortcutData: shortcut_data) {
		switch (shortcutData.function) {
			case "toggleSnap":
				data_path.snap = !data_path.snap
				break;
			
			case "deleteLastPoint":
				if (data_path.selectedPath) {
					removeLastPoint(data_path.selectedPath);
				}
				break;	
			
			case "deletePath":
				if (data_path.selectedPath) {
					deletePath(data_path.selectedPath);
				}
				break;
			
			case "deselect":
				data_path.selectedPath = null;
				break;
		}
	}

	export function keydown(e: KeyboardEvent) {
		switch (e.key) {
			case "Shift":
				data_path.dontSelectPaths = true;
				break;
		}
	}

	export function keyup(e: KeyboardEvent) {
		switch (e.key) {
			case "Shift":
				data_path.dontSelectPaths = false;
				break;
		}
	}

	const HOVEREDSELECTORSTYLE: PIXI.LineStyle = { width: 1, color: 0x555555 };
	const SELECTEDSELECTORSTYLE: PIXI.LineStyle = { width: 2, color: 0x333333 };
</script>

{#each paths as path (path.id)}
	<Container
		hitArea={findHitArea(path)}
		interactive={selectedTool == 'path' && !data_path.selectedPath}
		on:pointerover={() => {
			data_path.hoveredPath = path;
		}}
		on:pointerout={() => {
			data_path.hoveredPath = null;
		}}
	>
		<Graphics
			draw={(g) => {
				g.clear();
				g.lineStyle(path.style);
				g.moveTo(path.points[0], path.points[1]);
				for (let pI = 0; pI < path.points.length; pI += 2) {
					g.lineTo(path.points[pI], path.points[pI + 1]);
				}

				
			}}
		/>


	</Container>
{/each}

{#if data_path.selectedPath}
	<Graphics
			draw={(g) => {
				g.clear();
				g.lineStyle(SELECTEDSELECTORSTYLE);
				for (let pI = 0; pI < data_path.selectedPath.points.length; pI += 2) {
					g.drawCircle(data_path.selectedPath.points[pI], data_path.selectedPath.points[pI + 1], 4);
				}
				 
			}}
		/>
{/if}


{#if data_path.hoveredPath && !data_path.dontSelectPaths}
	<Graphics
			draw={(g) => {
				g.clear();
				g.lineStyle(HOVEREDSELECTORSTYLE);
				for (let pI = 0; pI < data_path.hoveredPath.points.length; pI += 2) {
					g.drawCircle(data_path.hoveredPath.points[pI], data_path.hoveredPath.points[pI + 1], 3);
				}
			}}	
		/>
{/if}

