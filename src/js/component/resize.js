/**
 * @author Sabinaya KC <kc.sabinaya@gmail.com>
 * @fileoverview Image Resize module
 */
// import fabric from 'fabric/dist/fabric.require';
import Component from '../interface/component';
import consts from '../consts';

const {componentNames, eventNames} = consts;
/**
 * Image Resize component
 * @class Resize
 * @extends {Component}
 * @param {Graphics} graphics - Graphics instance
 * @ignore
 */
class Resize extends Component {
    constructor(graphics) {
        super(componentNames.RESIZE, graphics);
        this.dimensions = {};
    }

    getCurrentDimensions() {
        return this.dimensions;
    }

    /**
      * Resize Image
      * @param {Object} dimensions - Zoom Transform Value
      * @returns {Promise}
      * @private
      */
    resize(dimensions) {
        const canvas = this.getCanvas();
        const image = canvas.toDataURL();
        fabric.Image.fromURL(image, img => {
            img.set({scaleX: dimensions.width / img.width,
                scaleY: dimensions.height / img.height});
            this.fire(eventNames.IMAGE_RESIZED, img);
        });

        return Promise.resolve();
    }
}
module.exports = Resize;
