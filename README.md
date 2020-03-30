# Fork of Tui-Image-Editor
- Zoom
- Pan
- Undo/Redo Data
- Arrow Shape

# Zoom 
`setZoom(value: number, reset: boolean = false);` 

- value > 1 && value < n 
- reset = true (resets zoom and transform) 

# Pan
- Hold Shift Key + Mouse Drag (Zoom must be greater than 1) 

# Undo/Redo Data
`imageEditor.undo().then(undoData => console.log(undoData));`
`imageEditor.redo().then(redoData => console.log(redoData));`

- Useful for updating UI to last redo or undo change. 

#Arrow Shape
- New arrow shape can be used from Shape Menu
