# Fork of Tui-Image-Editor
`npm install @sabinayakc/tui.image-editor`

## Added Functionalities
- Zoom
- Pan
- Undo/Redo Data
- Arrow Shape
- Resize

### Zoom 
`setZoom(value: number, reset: boolean = false);` 

- value > 1 & value < n 
- reset = true (resets zoom and transform) 

### Pan
- Listen to image panned event. 
```
imageEditor.on(
    imagePanned: (pan) => { 
        if (pan.x) {
          //If Pan.X is true, this means the width of image is not inside pan boundary
        }
        if (pan.y) {
          //If Pan.Y is true, this means the height of image is not inside pan boundary
        }
      }
   );
```  
- Hold Shift Key + Mouse Drag (Zoom must be greater than 1) to pan the image. 

### Undo/Redo Data
`imageEditor.undo().then(undoData => console.log(undoData));`
`imageEditor.redo().then(redoData => console.log(redoData));`

- Useful for updating UI to last redo or undo change. 

### Arrow Shape
- New arrow shape type. 
` imageEditor.setDrawingShape('arrow');`
- To create an arrow, click on the canvas to create the arrow orign and drag the mouse to where you want the arrow to point. 

### Resize 
`imageEditor.resize({width: 640, height : 480})`
- Listen to image resized event
`imageEditor.on(imageResized: img => console.log('Resized image', img));`
