<script lang="ts">

    import type { path } from 'src/types/path'
    import type { TerrainHexField } from 'src/types/terrain';
    import type { path_data } from 'src/types/data';

    import { Graphics, Container } from 'svelte-pixi'
    import { coords_worldToCube, cube_round, coords_cubeToWorld } from '../helpers/hexHelpers';

    import * as PIXI from 'pixi.js'

    export let controls;
    export let pan;
    export let selectedTool
    export let tfield: TerrainHexField // required for snapping

    export let data_path: path_data

    export let paths: path[] = []
    

    let hoveredPath: path | null = null;

    let pathId: number = 0
    paths.forEach(p => pathId = Math.max(pathId, p.id))
    pathId++

    function appendPoint(path: path, x: number, y: number) {
        path.points = [...path.points, x, y]
        paths = paths
    }

    export function pointerdown(e: PointerEvent) {

        if (controls.mouseDown[0]) {

            if (data_path.selectedPath) {
                let pX = pan.worldX
                let pY = pan.worldY
                if (data_path.snap) {
                    let sP = getSnapPoint()
                    pX = sP.x
                    pY = sP.y
                }

                appendPoint(data_path.selectedPath, pX, pY)
    
            } else if (hoveredPath) {
                data_path.selectedPath = paths[paths.indexOf(hoveredPath)]
                data_path.style = {...data_path.selectedPath.style}
                hoveredPath = null
    
            } else {
                addNewPath()

            }

        }
        
    }

    export function removeLastPoint(path: path) {
        path.points.pop()
        path.points.pop()
        paths = paths

        if (path.points.length == 0) deletePath(path)
    }

    export function deletePath(path: path) {
        data_path.selectedPath = null

        let pathIndex = paths.indexOf(path)
        paths.splice(pathIndex, 1)

        paths = paths
    }
    
    function getSnapPoint() {
        let hW = tfield.hexWidth
        let hH = tfield.hexHeight

        let clickedCoords = coords_worldToCube(pan.worldX, pan.worldY, tfield.orientation, tfield.hexWidth, tfield.hexHeight, tfield.raised)
        let centerCoords = coords_cubeToWorld(clickedCoords.q, clickedCoords.r, clickedCoords.s, tfield.orientation, tfield.hexWidth, tfield.hexHeight, tfield.raised)

        let closestPoint = {x: Infinity, y: Infinity}
        let shortestDist = Infinity

        let snapPoints;

        if (tfield.orientation == "flatTop") {

            snapPoints = [
                centerCoords,
                {x: centerCoords.x + hW/4, y: centerCoords.y - hH/2},
                {x: centerCoords.x + hW/2, y: centerCoords.y},
                {x: centerCoords.x + hW/4, y: centerCoords.y + hH/2},
                {x: centerCoords.x - hW/4, y: centerCoords.y + hH/2},
                {x: centerCoords.x - hW/2, y: centerCoords.y},
                {x: centerCoords.x - hW/4, y: centerCoords.y - hH/2},
            ]

        } else if (tfield.orientation == "pointyTop") {
            snapPoints = [
                centerCoords,
                {x: centerCoords.x, y: centerCoords.y-hH/2},
                {x: centerCoords.x+hW/2, y: centerCoords.y-hH/4},
                {x: centerCoords.x+hW/2, y: centerCoords.y+hH/4},
                {x: centerCoords.x, y: centerCoords.y},
                {x: centerCoords.x-hW/2, y: centerCoords.y+hH/4},
                {x: centerCoords.x-hW/2, y: centerCoords.y+hH/4},
            ]
        }

        snapPoints.forEach(p => {
            let dist = Math.sqrt( (p.x - pan.worldX)**2 + (p.y - pan.worldY)**2 )
            if (dist < shortestDist) {
                closestPoint = p
                shortestDist = dist
            }
        })
        
        return closestPoint
    }

    function addNewPath() {
        
        let pX = pan.worldX
        let pY = pan.worldY

        if (data_path.snap) {
            let snapPoint = getSnapPoint()
            pX = snapPoint.x
            pY = snapPoint.y
        }

        paths.push({id: pathId, style: {...data_path.style}, points: [pX, pY] })
        paths = paths
        pathId++
        data_path.selectedPath = paths[paths.length-1]
        //console.log(paths);
    }

    function getHitArea(path: path): PIXI.Rectangle {

        let leftMostX = Infinity
        let rightMostX = -Infinity
        let topMostY = Infinity
        let bottomMostY = -Infinity

        for (let pI=0; pI<path.points.length; pI+=2) {
            let curX = path.points[pI]
            let curY = path.points[pI+1]

            if (curX < leftMostX) leftMostX = curX
            if (curX > rightMostX) rightMostX = curX
            topMostY = Math.min(topMostY, curY)
            bottomMostY = Math.max(bottomMostY, curY)
        }

        let hitAreaMargin = 5
        let n = new PIXI.Rectangle(leftMostX-hitAreaMargin, topMostY-hitAreaMargin, rightMostX-leftMostX + hitAreaMargin*2, bottomMostY-topMostY + hitAreaMargin*2)
        //console.log(n);
        return n;

    }

    export function moveAllPaths(xMod: number, yMod: number) {
        paths.forEach(path => {
            for (let pI=0; pI < path.points.length; pI += 2) {
                path.points[pI] += xMod
                path.points[pI+1] += yMod
            }
        })

        paths = paths
    }

    const HOVEREDSELECTORSTYLE = { width: 1, color: 0x555555 }
    const SELECTEDSELECTORSTYLE = { width: 2, color: 0x333333 }

</script>

{#each paths as path (path.id)}

    <Container
        interactive={ selectedTool == "path" && !data_path.selectedPath }
        hitArea={ getHitArea(path) }
        on:pointerover={ () => { hoveredPath = path } }
        on:pointerout={ () => {hoveredPath = null} }
    >
        <Graphics 
            draw={g => {
                g.clear();
                g.lineStyle(path.style)
                g.moveTo(path.points[0], path.points[1]);
                for (let pI=0; pI < path.points.length; pI += 2) {
                    g.lineTo(path.points[pI], path.points[pI+1])

                }

                if (data_path.selectedPath == path) {
                    g.lineStyle(SELECTEDSELECTORSTYLE)
                    for (let pI=0; pI < path.points.length; pI += 2) {
                        g.drawCircle(path.points[pI], path.points[pI+1], 4)
                    }
                    
                } else if (hoveredPath == path) {
                    g.lineStyle(HOVEREDSELECTORSTYLE)
                    for (let pI=0; pI < path.points.length; pI += 2) {
                        g.drawCircle(path.points[pI], path.points[pI+1], 3)
                    }

                }


        }} />

    </Container>

{/each}
