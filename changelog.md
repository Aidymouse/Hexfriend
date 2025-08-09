# Changelog
For Techy People

# Version 3.0 - Found your feet, Hexfriend

## Version 3.0
_Some tooltips + the new wiki entry in the about will need translation. Translations now have a typescript type so it should be pretty easy to figure out what needs translating._
- Updated save data format to v13, changing a couple names to snake_case
- Tileset import dialog looks for .hfts files now
- Overhauled many of the types, they were so messy
- Added wiki link in about
- Hexfriend no longer relies on the loading of the hexfriend loading graphic to initiate the initial map load 
- Hex Symbols are now Icons internally, for easier code re-use
- Icons and Terrain have two scale modes now. One maintains aspect ratio (pre-3.0 behaviour) and one stretches the image to fit a pre-defined percentage of the hexes width and height. In laymans terms, Hexfriend now supports image-based tilesets.
- Establish an icon set converter so old iconset versions can be updated
- Default hex height has become 43.3, a close-enough approximation of a true hex
- Default Tileset updates to v9, default Iconset to v6
- You can now import the same tileset or iconset more than once (it makes copies)
- The default tileset does not have an option to update it if it's on an outdated version (but you can import the latest tileset because of the change above this one)

# Version 2.0 - Whole new worlds, Hexfriend!

## Version 2.2
_Doesn't require any translation updates_
- Added ability to rotate Terrain symbols and Icons aribtrarily (thanks FuzzyBunny on the Discord for the great idea)
- Updated default tileset to v8 to store rotation on tile symbols

## Version 2.1
- Updated Brazilian Portuguese translation (thanks Igor!)

## Version 2.0
- Added translation support. You can contribute your language by providing a [translation file](https://github.com/Aidymouse/Hexfriend/tree/master/src/lib/translations)
- Added a seed to terrain and icon generators
- Added ability to import and export icon generation rulesets

# Version 1.9 - Sorting out your internals, Hexfriend

## Version 1.9.14
- Remove hard coded icon size limit
- All datas now in stores
- Turn various $: {} into subscriptions to relevant stores
- Rename store_selected_tool to selected_tool
- Eraser tooltip fix
- Eraser ignore options added

## Version 1.9.13
- Map styling UX
- Tooltip changes
- Remove tight zoom limit
- Dynamic text resolution
- Warning that reducing map size deletes hexes

## Version 1.9.12
- Various breakages and subsequent bug fixes

## Version 1.9.11
- Icon fixes

## Version 1.9.10
- Settings UX improvements (they slide now!)
- Addressed pixi deprecations (thanks craig)
- Easter egg upgrade

## Version 1.9.9
- Icon generator has a new option to clear icons before generation
- Tweaked checkbox config option placement for icon and terrain generators
- Settings refactored into seperate containers. Minor UI changes
- New easter egg

## Version 1.9.8
- Changelog now opens new tab
- Icon Eyedropper doesnt get stuck when alt tabbing

## Version 1.9.7
- Fixed tilset updating not working
- Orientation of selected overlay and hex tools sync up with hex orientation again 

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
