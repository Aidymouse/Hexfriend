# Changelog
For Techy People

# Version 1.9 - Sorting out your internals, Hexfriend

## Version 1.9.6
- Coordinates can now be offset
- Coordinates update properly when resizing by hex radius
- Hexes setting layout change - indented column above size changes
- Raised Column / Indented Row for Big Grid Hexes only appears on square map shapes  

## Version 1.9.5
- Overlay image no longer moves when map is reduced in size

## Version 1.9.4
- Added ability to erase all icons, paths and text
- Overlay image no longer moves when map is expanded
- Overlay data now kept in store

## Version 1.9.3
- Position retaining algorithm now uses vector to center of hex rather than postion from left and top of hex
- Paths and texts now retain relative positions when 
- Old retainment parameters are now kept in a store
- Added new toggles for icon, path and text position retaining when resizing hexes

## Version 1.9.2
- Can determine hex size by radius

## Version 1.9.1
- The terrain field (tfield) is now a store
- Fixed bug where icons would dissapear on hex resize
- Fixed bug where icons wouldn't retain position when hex height changed
- Updated changelog to have bullet points

## Version 1.9.0
- Tile names now local scoped to tileset ID
- Texture loader revamped to identify tile textures based on tileset ID and tile name
- Save data updated to v10

# Version 1.8 - New Stripes, Hexfriend

## Version 1.8.6
- Clicking left mouse + right mouse at the same time no longer makes panning sticky
- Releasing right click over the toolbar no longer makes panning stick

## Version 1.8.5
- Icon scale UX improvements
- Icon Eyedropper
- Save data version update
- Note: due to code choices the icon eyedropper will not pick out size on old maps


## Version 1.8.4
- Coordinates bug fix
- Save data converter path fix

## Version 1.8.3
- Icon scale bug fix

## Version 1.8.2
- Grid gap added (thanks Evan!)
- Save data update to version 8

## Version 1.8.1
- Added changelog

## Version 1.8.0
- Added dashed lines
- Path data change (paths now have dash info in style)
- Path data moved to store