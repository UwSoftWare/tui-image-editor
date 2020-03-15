/**
 * @author Sabinaya KC <kc.sabinaya@gmail.com>
 * @fileoverview Image zoom module
 */
// import fabric from 'fabric/dist/fabric.require';
import Promise from 'core-js/library/es6/promise';
import Component from '../interface/component';
import consts from '../consts';

const {componentNames} = consts;
/**
 * Image Zoom component
 * @class Zoom
 * @extends {Component}
 * @param {Graphics} graphics - Graphics instance
 * @ignore
 */
class Zoom extends Component {
    constructor(graphics) {
        super(componentNames.ZOOM, graphics);
        /**
         * Listeners
         * @type {object.<string, function>}
         * @private
        */
        this._listeners = {
            mousedown: this._onFabricMouseDown.bind(this),
            mousemove: this._onFabricMouseMove.bind(this),
            mouseup: this._onFabricMouseUp.bind(this)
        };
        /**
         * Zoom Settings
         * @type {object}
         * @private
         */
        this._zoomScale = 1;
        this._didPan = false;
        this._viewportTransform = {
            width: this.getCanvas().viewportTransform[4],
            height: this.getCanvas().viewportTransform[5]
        };
    }

    /**
     * Get current value
     * @returns {object}
     */
    getCurrentValue() {
        return this._zoomScale;
    }

    /**
     * Get current value
     * @returns {object}
     */
    getViewPortTransform() {
        return this._viewportTransform;
    }

    /**
     * Set zoom value of the image
     * @param {number} scale - Zoom Scale Value
     * @param {boolean} reset - Zoom Scale Value
     * @returns {jQuery.Deferred}
     */
    setZoomValue(scale, reset) {
        if (!reset) {
            this._zoomScale = scale;
            this._zoomCanvas();
        } else {
            this._zoomScale = 1;
            this.resetCanvas();
        }

        return Promise.resolve();
    }

    /**
     * Reset ViewPort
     * @param {object} viewportTransform - Scale Value to Zoom in our Zoom out
     * @private
     */
    resetCanvas() {
        const canvas = this.getCanvas();
        if (this._didPan) {
            canvas.absolutePan(
                new fabric.Point(0, 0)
            );
        }
        this._didPan = false;
        canvas.setZoom(1);
    }

    /**
     * Zoom Canvas
     * @param {number} zoom - Scale Value to Zoom in our Zoom out
     * @private
     */
    _zoomCanvas() {
        const canvas = this.getCanvas();
        if (this._zoomScale < 1) {
            this._zoomScale = 1;
        }
        canvas.setZoom(this._zoomScale);
        canvas.on({
            'mouse:down': this._listeners.mousedown
        });
    }

    /**
     * onMousedown handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onFabricMouseDown(fEvent) {
        const canvas = this.getCanvas();
        if (fEvent.e.altKey === true) {
            canvas.isDragging = true;
            canvas.selection = false;
            canvas.lastPosX = fEvent.e.clientX;
            canvas.lastPosY = fEvent.e.clientY;
            canvas.on({
                'mouse:move': this._listeners.mousemove,
                'mouse:up': this._listeners.mouseup
            });
        }
    }

    /**
     * onMousemove handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    // eslint-disable-next-line complexity
    _onFabricMouseMove(fEvent) {
        const canvas = this.getCanvas();
        const wrapperWidth = canvas.wrapperEl.clientWidth;
        const wrapperHeight = canvas.wrapperEl.clientHeight;
        const zoom = canvas.getZoom();
        if (canvas.isDragging) {
            if (zoom < 0.4) {
                canvas.viewportTransform[4] = 200 - (1000 * zoom / 2);
                canvas.viewportTransform[5] = 200 - (1000 * zoom / 2);
            } else {
                canvas.viewportTransform[4] += fEvent.e.clientX - canvas.lastPosX;
                canvas.viewportTransform[5] += fEvent.e.clientY - canvas.lastPosY;
                if (canvas.viewportTransform[4] >= 0) {
                    canvas.viewportTransform[4] = 0;
                } else if (canvas.viewportTransform[4] < (wrapperWidth - (wrapperWidth * zoom)) * 2.3) {
                    canvas.viewportTransform[4] = (wrapperWidth - (wrapperWidth * zoom)) * 2.3;
                }
                if (canvas.viewportTransform[5] >= 0) {
                    canvas.viewportTransform[5] = 0;
                } else if (canvas.viewportTransform[5] < (wrapperHeight - (wrapperHeight * zoom)) * 2.3) {
                    canvas.viewportTransform[5] = (wrapperHeight - (wrapperHeight * zoom)) * 2.3;
                }
            }
            // eslint-disable-next-line no-console
            console.log(canvas.viewportTransform, wrapperHeight, (wrapperHeight * zoom),
                fEvent.e.clientX - canvas.lastPosX);
            this._didPan = true;
            canvas.renderAll();
            canvas.lastPosX = fEvent.e.clientX;
            canvas.lastPosY = fEvent.e.clientY;
        }
    }

    /**
     * onMouseup handler in fabric canvas
     * @private
    */
    _onFabricMouseUp() {
        const listeners = this._listeners;
        const canvas = this.getCanvas();
        canvas.isDragging = false;
        canvas.selection = true;
        canvas.off({
            'mouse:move': listeners.mousemove,
            'mouse:up': listeners.mouseup
        });
    }
}
module.exports = Zoom;
