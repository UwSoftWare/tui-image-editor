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

            this.blurRect(
                bufferCtx,
                0,
                0,
                this.width,
                2
            );

            canvas.add(
                new fabric.Image(buffer, {
                    top: pointer.y - (this.width / 2),
                    left: pointer.x - (this.width / 2)
                })
            );
        }
        canvas.off({
            'mouse:up': this._handlers.mouseup
        });
    }

    boxBlur(src, w, h, r) {
        const tmp = new Uint8Array(w * h * 4);
        this.blurRight(src, tmp, w, h, r);
        this.blurDown(tmp, src, w, h, r);
        this.blurLeft(src, tmp, w, h, r);
        this.blurUp(tmp, src, w, h, r);
    }

    blurRight(src, dest, w, h, r) {
        let i, j, offset, pos, posR;

        const shiftR = r << 2;
        const shiftW = w << 2;

        let weightR, weightG, weightB, weightA;

        for (j = 0; j < h; j += 1) {
            weightR = 0;
            weightG = 0;
            weightB = 0;
            weightA = 0;

            offset = j * shiftW;

            for (i = 0; i < r; i += 1) {
                pos = offset + (i << 2);

                weightR += src[pos];
                weightG += src[pos + 1];
                weightB += src[pos + 2];
                weightA += src[pos + 3];

                dest[pos] = (weightR / (i + 1)) | 0;
                dest[pos + 1] = (weightG / (i + 1)) | 0;
                dest[pos + 2] = (weightB / (i + 1)) | 0;
                dest[pos + 3] = (weightA / (i + 1)) | 0;
            }

            for (; i < w; i += 1) {
                pos = offset + (i << 2);
                posR = pos - shiftR;

                dest[pos] = (weightR / r) | 0;
                dest[pos + 1] = (weightG / r) | 0;
                dest[pos + 2] = (weightB / r) | 0;
                dest[pos + 3] = (weightA / r) | 0;

                weightR += src[pos] - src[posR];
                weightG += src[pos + 1] - src[posR + 1];
                weightB += src[pos + 2] - src[posR + 2];
                weightA += src[pos + 3] - src[posR + 3];
            }
        }
    }

    blurLeft(src, dest, w, h, r) {
        let i, j, offset, pos, posR;

        const shiftR = r << 2;
        const shiftW = w << 2;

        let weightR, weightG, weightB, weightA;

        for (j = 0; j < h; j += 1) {
            weightR = 0;
            weightG = 0;
            weightB = 0;
            weightA = 0;

            offset = j * shiftW;

            for (i = w - 1; i >= w - r; i -= 1) {
                pos = offset + (i << 2);

                weightR += src[pos];
                weightG += src[pos + 1];
                weightB += src[pos + 2];
                weightA += src[pos + 3];

                dest[pos] = (weightR / (w - i)) | 0;
                dest[pos + 1] = (weightG / (w - i)) | 0;
                dest[pos + 2] = (weightB / (w - i)) | 0;
                dest[pos + 3] = (weightA / (w - i)) | 0;
            }

            for (; i >= 0; i -= 1) {
                pos = offset + (i << 2);
                posR = pos + shiftR;

                dest[pos] = (weightR / r) | 0;
                dest[pos + 1] = (weightG / r) | 0;
                dest[pos + 2] = (weightB / r) | 0;
                dest[pos + 3] = (weightA / r) | 0;

                weightR += src[pos] - src[posR];
                weightG += src[pos + 1] - src[posR + 1];
                weightB += src[pos + 2] - src[posR + 2];
                weightA += src[pos + 3] - src[posR + 3];
            }
        }
    }

    blurDown(src, dest, w, h, r) {
        let i, j, offset, pos, posR;

        const shiftW = w << 2;

        const offsetR = shiftW * r;

        let weightR, weightG, weightB, weightA;

        for (i = 0; i < w; i += 1) {
            weightR = 0;
            weightG = 0;
            weightB = 0;
            weightA = 0;

            offset = i << 2;

            for (j = 0; j < r; j += 1) {
                pos = offset + (j * shiftW);

                weightR += src[pos];
                weightG += src[pos + 1];
                weightB += src[pos + 2];
                weightA += src[pos + 3];

                dest[pos] = (weightR / (j + 1)) | 0;
                dest[pos + 1] = (weightG / (j + 1)) | 0;
                dest[pos + 2] = (weightB / (j + 1)) | 0;
                dest[pos + 3] = (weightA / (j + 1)) | 0;
            }

            for (; j < h; j += 1) {
                pos = offset + (j * shiftW);
                posR = pos - offsetR;

                dest[pos] = (weightR / r) | 0;
                dest[pos + 1] = (weightG / r) | 0;
                dest[pos + 2] = (weightB / r) | 0;
                dest[pos + 3] = (weightA / r) | 0;

                weightR += src[pos] - src[posR];
                weightG += src[pos + 1] - src[posR + 1];
                weightB += src[pos + 2] - src[posR + 2];
                weightA += src[pos + 3] - src[posR + 3];
            }
        }
    }

    blurUp(src, dest, w, h, r) {
        let i, j, offset, pos, posR;

        const shiftW = w << 2;

        const offsetR = shiftW * r;

        let weightR, weightG, weightB, weightA;

        for (i = 0; i < w; i += 1) {
            weightR = 0;
            weightG = 0;
            weightB = 0;
            weightA = 0;

            offset = i << 2;

            for (j = h - 1; j >= h - r; j -= 1) {
                pos = offset + (j * shiftW);

                weightR += src[pos];
                weightG += src[pos + 1];
                weightB += src[pos + 2];
                weightA += src[pos + 3];

                dest[pos] = (weightR / (h - j)) | 0;
                dest[pos + 1] = (weightG / (h - j)) | 0;
                dest[pos + 2] = (weightB / (h - j)) | 0;
                dest[pos + 3] = (weightA / (h - j)) | 0;
            }

            for (; j >= 0; j -= 1) {
                pos = offset + (j * shiftW);
                posR = pos + offsetR;

                dest[pos] = (weightR / r) | 0;
                dest[pos + 1] = (weightG / r) | 0;
                dest[pos + 2] = (weightB / r) | 0;
                dest[pos + 3] = (weightA / r) | 0;

                weightR += src[pos] - src[posR];
                weightG += src[pos + 1] - src[posR + 1];
                weightB += src[pos + 2] - src[posR + 2];
                weightA += src[pos + 3] - src[posR + 3];
            }
        }
    }

    blurRect(ctx, x, y, w, r) {
        const {canvas} = ctx;

        const blurCanvas = document.createElement('canvas');
        blurCanvas.width = screen.width;
        blurCanvas.height = screen.height;
        const blurCtx = blurCanvas.getContext('2d');

        const srcW = w | 0;
        const srcH = w | 0;

        const srcX = x | 0;
        const srcY = y | 0;

        r = (r | 0) * 32;
        r = Math.min(Math.max(r, 32), 256);

        const resizeFactor = Math.max(0, ((Math.log(r) / Math.log(2)) - 3) | 0);
        const radius = r >>> resizeFactor;

        const resizeWidth = canvas.width >>> resizeFactor;
        const resizeHeight = canvas.height >>> resizeFactor;

        blurCtx.drawImage(canvas, 0, 0, resizeWidth, resizeHeight);
        const imageData = blurCtx.getImageData(0, 0, resizeWidth, resizeHeight);

        this.boxBlur(imageData.data, resizeWidth, resizeHeight, radius);

        blurCtx.putImageData(imageData, 0, 0);

        blurCtx.drawImage(
            blurCanvas,
            0,
            0,
            resizeWidth,
            resizeHeight,
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.drawImage(
            blurCanvas,
            srcX,
            srcY,
            srcW,
            srcH,
            srcX,
            srcY,
            srcW,
            srcH
        );

        return ctx;
    }
}

module.exports = Blur;
