/**
 * @author Sabinaya KC <kc.sabinaya@gmail.com>
 * @fileoverview Image zoom module
 */
// import fabric from 'fabric/dist/fabric.require';
import Promise from 'core-js/library/es6/promise';
import Component from '../interface/component';
import consts from '../consts';

const {componentNames, eventNames} = consts;
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
        this.prevZoomValue = 0;
        this._didPan = false;
        this._viewportTransform = {
            width: this.getCanvas().viewportTransform[4],
            height: this.getCanvas().viewportTransform[5]
        };

        const canvas = this.getCanvas();
        canvas.on({
            'mouse:down': this._listeners.mousedown
        });
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
     * @param {Array} transform - Zoom Transform Value
     * @returns {jQuery.Deferred}
     */
    setZoomValue(scale, reset, transform) {
        if (!reset) {
            this._zoomScale = scale;
            this._zoomCanvas();
        } else {
            this._zoomScale = 1;
            this.resetCanvas(transform);
        }

        return Promise.resolve();
    }

    /**
     * Reset ViewPort
     * @param {Array} transform - Zoom Transform Value
     * @private
     */
    resetCanvas(transform) {
        const canvas = this.getCanvas();
        if (transform) {
            canvas.setViewportTransform(transform);
        } else {
            canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        }
        this._didPan = false;
    }

    /**
     * Zoom Canvas
     * @param {number} zoom - Scale Value to Zoom in our Zoom out
     * @private
     */
    _zoomCanvas() {
        const canvas = this.getCanvas();
        if (this._zoomScale < 0) {
            this._zoomScale = 1;
        }

        if (this._zoomScale < this.prevZoomValue && this._didPan) {
            this._didPan = false;
        }

        this.resetCanvas();
        this.adjustCanvasDimension();
        canvas.renderAll();
        this.prevZoomValue = this._zoomScale;
    }

    /**
     * onMousedown handler in fabric canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event
     * @private
     */
    _onFabricMouseDown(fEvent) {
        const canvas = this.getCanvas();

        if (this.graphics.getDrawingMode() === 'NORMAL') {
            if (this.getCurrentValue() === 1.0) {
                return;
            }
            canvas.isDragging = true;
            canvas.selection = false;

            canvas.lastPosX = fEvent.e.clientX;
            if (fEvent.e.touches && fEvent.e.touches[0] && fEvent.e.touches[0].clientX) {
                canvas.lastPosX = fEvent.e.touches[0].clientX;
            }
            canvas.lastPosY = fEvent.e.clientY;
            if (fEvent.e.touches && fEvent.e.touches[0] && fEvent.e.touches[0].clientY) {
                canvas.lastPosY = fEvent.e.touches[0].clientY;
            }
            canvas.lastT4 = canvas.viewportTransform[4];
            canvas.lastT5 = canvas.viewportTransform[5];
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
        if (canvas.isDragging) {
            let {clientX, clientY} = fEvent.e;
            if (fEvent.e.touches && fEvent.e.touches[0] && fEvent.e.touches[0].clientX) {
                clientX = fEvent.e.touches[0].clientX;
            }
            if (fEvent.e.touches && fEvent.e.touches[0] && fEvent.e.touches[0].clientY) {
                clientY = fEvent.e.touches[0].clientY;
            }
            const diffX = (clientX - canvas.lastPosX);
            canvas.viewportTransform[4] = canvas.lastT4 + diffX;
            if (canvas.viewportTransform[4] >= 0) {
                canvas.viewportTransform[4] = 0;
            }
            const diffY = (clientY - canvas.lastPosY);
            canvas.viewportTransform[5] = canvas.lastT5 + diffY;
            if (canvas.viewportTransform[5] >= 0) {
                canvas.viewportTransform[5] = 0;
            }
            this._didPan = true;
            canvas.renderAll();

            // eslint-disable-next-line no-console
            console.log(fEvent.e, diffX, diffY, canvas.viewportTransform, canvas.lastT4, canvas.lastT5);
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
        const data = {
            x: canvas.vptCoords.br.x > canvas.width,
            y: canvas.vptCoords.br.y > canvas.height
        };
        this.fire(eventNames.IMAGE_PANNED, data);
        canvas.off({
            'mouse:move': listeners.mousemove,
            'mouse:up': listeners.mouseup
        });
    }
}
module.exports = Zoom;
