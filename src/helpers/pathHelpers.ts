import { HexOrientation, type HexSizeParams, type PathLayerPath, type PathStyle } from '../types'
import { coords_cubeToWorld, coords_worldToCube } from './hexHelpers'

import { Vector } from '../lib/vector2d'

import * as PIXI from 'pixi.js'

export const pathStylesMatch = (style1: PathStyle, style2: PathStyle): boolean => {
  for (const [k, v] of Object.entries(style1)) {
    if (v !== style2[k]) {
      return false
    }
  }
  return true
}

// Overlay a grid of smaller opposite orientation hexes and it lines up perfectly!
export const getPathSnapPoint = (x: number, y: number, hex_info: HexGridParams) => {
  let snap_grid_orientation =
    hex_info.orientation == HexOrientation.FLATTOP ? HexOrientation.POINTYTOP : HexOrientation.FLATTOP
  let snap_grid_hexWidth = (hex_info.width + hex_info.gap) / (hex_info.orientation == HexOrientation.FLATTOP ? 2 : 1.5)
  let snap_grid_hexHeight =
    (hex_info.height + hex_info.gap) / (hex_info.orientation == HexOrientation.FLATTOP ? 1.5 : 2)

  let snap_coords = coords_worldToCube(
    x,
    y,
    snap_grid_orientation,
    snap_grid_hexWidth,
    snap_grid_hexHeight,
    hex_info.gap,
  )

  return coords_cubeToWorld(
    snap_coords.q,
    snap_coords.r,
    snap_coords.s,
    snap_grid_orientation,
    snap_grid_hexWidth,
    snap_grid_hexHeight,
    hex_info.gap,
  )
}
function pathPointsToPoints(path: PathLayerPath): Vector[] {
  let points = []
  for (let pI = 0; pI < path.points.length; pI += 2) {
    points.push(new Vector(path.points[pI], path.points[pI + 1]))
  }
  return points
}

function findIntersectionPoint(line1, line2) {
  // Check if none of the lines are of length 0
  if (
    (line1.start.x === line1.end.x && line1.start.y === line1.end.y) ||
    (line2.start.x === line2.end.x && line2.start.y === line2.end.y)
  ) {
    return false
  }

  let denominator =
    (line2.end.y - line2.start.y) * (line1.end.x - line1.start.x) -
    (line2.end.x - line2.start.x) * (line1.end.y - line1.start.y)

  // Lines are parallel
  if (denominator === 0) {
    return false
  }

  let ua =
    ((line2.end.x - line2.start.x) * (line1.start.y - line2.start.y) -
      (line2.end.y - line2.start.y) * (line1.start.x - line2.start.x)) /
    denominator
  let ub =
    ((line1.end.x - line1.start.x) * (line1.start.y - line2.start.y) -
      (line1.end.y - line1.start.y) * (line1.start.x - line2.start.x)) /
    denominator

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return false
  }

  // Return a object with the x and y coordinates of the intersection
  let x = line1.start.x + ua * (line1.end.x - line1.start.x)
  let y = line1.start.y + ua * (line1.end.y - line1.start.y)

  return { x, y }
}

export function findHitArea(path: PathLayerPath): PIXI.Polygon {
  let boxWidth = 5 + path.style.width

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
    ])

  let pathPoints = pathPointsToPoints(path)

  // Add first point

  // 0 radians = straight right
  // PI/2 radians = straight down
  // PI radians = straight left
  // -PI/2 radians = straight up

  // Set up initial two prior points

  // Names need some cleaning up, but i'll handle that later. Use the draw functions to help!

  let newPolyPoints = []
  let pointStack = []

  let firstSeg = Vector.subtract(pathPoints[1], pathPoints[0])
  let perpFirstSegDir = new Vector(firstSeg.y, -firstSeg.x).normalize()
  let firstPointLeft = Vector.add(pathPoints[0], Vector.multiply(perpFirstSegDir, boxWidth))
  let firstPointRight = Vector.add(pathPoints[0], Vector.multiply(perpFirstSegDir, -boxWidth))

  newPolyPoints.push(firstPointLeft)
  pointStack.push(firstPointRight)

  // Find points for corners
  for (let pI = 1; pI < pathPoints.length - 1; pI++) {
    let p1 = pathPoints[pI - 1]
    let p2 = pathPoints[pI]
    let p3 = pathPoints[pI + 1]

    let lineSeg1 = Vector.subtract(p2, p1)
    let lineSeg2 = Vector.subtract(p2, p3)

    let perpLine1Dir = new Vector(lineSeg1.y, -lineSeg1.x).normalize()
    let perpLine2Dir = new Vector(lineSeg2.y, -lineSeg2.x).normalize()

    let p1Left = Vector.add(p1, Vector.multiply(perpLine1Dir, boxWidth))
    let p1Right = Vector.add(p1, Vector.multiply(perpLine1Dir, -boxWidth))

    let p3Left = Vector.add(p3, Vector.multiply(perpLine2Dir, boxWidth))
    let p3Right = Vector.add(p3, Vector.multiply(perpLine2Dir, -boxWidth))

    // Find intersection Point between left lines
    let p1LeftLine = { start: p1Left, end: Vector.add(p1Left, Vector.multiply(lineSeg1, 5)) }
    let p3RightLine = { start: p3Right, end: Vector.add(p3Right, Vector.multiply(lineSeg2, 5)) }
    let newPointLeft = findIntersectionPoint(p1LeftLine, p3RightLine)

    let p1RightLine = { start: p1Right, end: Vector.add(p1Right, Vector.multiply(lineSeg1, 5)) }
    let p3LeftLine = { start: p3Left, end: Vector.add(p3Left, Vector.multiply(lineSeg2, 5)) }
    let newPointRight = findIntersectionPoint(p1RightLine, p3LeftLine)

    newPolyPoints.push(newPointLeft)
    pointStack.push(newPointRight)
  }

  let lastPoint = pathPoints[pathPoints.length - 1]
  let secondLastPoint = pathPoints[pathPoints.length - 2]

  let lastSeg = Vector.subtract(lastPoint, secondLastPoint)
  let perpLastSegDir = new Vector(lastSeg.y, -lastSeg.x).normalize()
  let lastPointLeft = Vector.add(lastPoint, Vector.multiply(perpLastSegDir, boxWidth))
  let lastPointRight = Vector.add(lastPoint, Vector.multiply(perpLastSegDir, -boxWidth))

  newPolyPoints.push(lastPointLeft)
  pointStack.push(lastPointRight)

  while (pointStack.length > 0) {
    newPolyPoints.push(pointStack.pop())
  }

  let newPolyParse = []
  newPolyPoints.forEach((point) => {
    if (point) newPolyParse.push(point.x, point.y)
  })

  let poly = new PIXI.Polygon(newPolyParse)
  /*
     g.lineStyle(3, 0xff0000);
     g.drawPolygon(poly)
     */

  return poly
}
