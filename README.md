I added two things for my use additional to sabinayakcs changes (described below). Maybe it helps someone else too:

- The Zoom gets back to 1 right before a cropping is applied. In my case the image got wrong resolution if the zoom was set to some else value.

- I enabled the zoom to be less than 1. Was there any reason for not doing this?

My setup is as following:

- I initialise TUI with full image size, so `cssMaxWidth` and `cssMaxHeight` is set to a never reached value like 100.000
- This leads to a very big image and I usually only need to zoom out ( < 1).
- The image is scrollable with scrollbars which indicate where I am. The Pan feature you introduced didnt worked well for me since the drawing tool always draws when  paning with shift + mouse.

The Zoom is done by a input, a 1:1 and a 100% button (html uses fomantic ui):
```html
<div class="ui action input"  style='position: absolute;    bottom: 12px;    z-index: 99;    left: 5px;'> 
    <input type="number" id='tui-zoom-input' min="1" max='1000' value="100" oninput="if(this.value >= 1){imageEditor.setZoom( (this.value / 100), false);}"> 
    <button class="ui button" onclick="$('#tui-zoom-input').val(100); imageEditor.setZoom(1, true);">1:1</button> 
    <button class="ui button" onclick="setInitialZoom();">auto</button> 
</div> 
```

The function `setInitialZoom()` is also called after tui is initialized and sets the zoom to fit the window and scrolls to the center:

```js
function setInitialZoom() { 
    let zoom = $('.tui-image-editor-wrap').height() / $('.tui-image-editor-size-wrap').height(); 
    let zoom2 = $('.tui-image-editor-wrap').width() / $('.tui-image-editor-size-wrap').width(); 
    if(zoom2 < zoom) { 
        zoom = zoom2; 
    } 
    zoom = zoom * 100; 
    zoom = Math.floor(zoom); 
    $('#tui-zoom-input').val(zoom); 
    zoom = zoom / 100; 
    imageEditor.setZoom(zoom, false); 
 
    function centerVertical(){//centralize vertical 
        var scrollableDivJ=$(".tui-image-editor-wrap"); 
        scrollableDivJ.scrollTop("1000000");//scroll to max 
        var scrollHeight=scrollableDivJ.prop("scrollHeight"); 
       var diff=(scrollHeight-scrollableDivJ.scrollTop())/2; 
       var middle=scrollHeight/2-diff; 
       scrollableDivJ.scrollTop(middle); 
    } 
 
    function centerHorizontal(){//centralize horizontal 
        var scrollableDivJ=$(".tui-image-editor-wrap"); 
        scrollableDivJ.scrollLeft("1000000");//scroll to max 
        var scrollWidth=scrollableDivJ.prop("scrollWidth"); 
        var diff=(scrollWidth-scrollableDivJ.scrollLeft())/2; 
        var middle=scrollWidth/2-diff; 
        scrollableDivJ.scrollLeft(middle); 
    } 
 
    centerVertical(); 
    centerHorizontal(); 
 
} 
```

If this makes sense, then it might be an idea to merge this into the zoom function itself. I haven't done this, because its referencing dom objects which aren't created by tui.
Maybe this PR doesn't make that much sense to you at all, but I just thought I'll share my implementation. 

![image](https://user-images.githubusercontent.com/3764089/81753129-643d0980-94b3-11ea-9bc5-ca942d35cf02.png)


----------

# sabinayakcs readme of his fork:
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
