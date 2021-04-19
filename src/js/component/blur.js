/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Free drawing module, Set brush
 */
import Component from '../interface/component';
import consts from '../consts';

/**
 * Blur
 * @class Blur
 * @param {Graphics} graphics - Graphics instance
 * @extends {Component}
 * @ignore
 */
class Blur extends Component {
    constructor(graphics) {
        super(consts.componentNames.BLUR, graphics);

        /**
         * Brush width
         * @type {number}
         */
        this.width = 500;

        /**
         * Event handler list
         * @type {Object}
         * @private
         */
        this._handlers = {
            mousedown: this._onFabricMouseDown.bind(this),
            mouseup: this._onFabricMouseUp.bind(this)
        };
    }

    /**
     * Start free drawing mode
     * @param {{width: ?number, color: ?string}} [setting] - Brush width & color
     */
    start(setting) {
        const canvas = this.getCanvas();

        this.width = setting.width;

        canvas.defaultCursor = 'crosshair';
        canvas.selection = false;
        canvas.uniScaleTransform = true;
        canvas.on({
            'mouse:down': this._handlers.mousedown
        });
    }

    /**
     * End free drawing mode
     */
    end() {
        const canvas = this.getCanvas();

        canvas.defaultCursor = 'default';

        canvas.uniScaleTransform = false;
        canvas.off({
            'mouse:down': this._handlers.mousedown
        });
    }

    /**
     * MouseDown event handler on canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
     * @private
     */
    _onFabricMouseDown(fEvent) {
        const canvas = this.getCanvas();
        this._startPoint = canvas.getPointer(fEvent.e);

        canvas.on({
            'mouse:up': this._handlers.mouseup
        });
    }

    /**
     * MouseUp event handler on canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
     * @private
     */
    _onFabricMouseUp(fEvent) {
        const canvas = this.getCanvas();
        const pointer = canvas.getPointer(fEvent.e);

        if (
            this._startPoint.x === pointer.x &&
            this._startPoint.y === pointer.y
        ) {
            const buffer = document.createElement('canvas');
            buffer.width = this.width;
            buffer.height = this.width;
            const bufferCtx = buffer.getContext('2d');
            bufferCtx.filter = 'blur(26px)';
            bufferCtx.drawImage(
                canvas.lowerCanvasEl,
                pointer.x - (this.width / 2),
                pointer.y - (this.width / 2),
                this.width,
                this.width,
                0,
                0,
                this.width,
                this.width
            );

            canvas.add(new fabric.Image(buffer, {
                top: pointer.y - (this.width / 2),
                left: pointer.x - (this.width / 2)
            }));
        }
        canvas.off({
            'mouse:up': this._handlers.mouseup
        });
    }
}

module.exports = Blur;
