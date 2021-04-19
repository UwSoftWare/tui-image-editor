/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview BlurMode class
 */
import DrawingMode from '../interface/drawingMode';
import consts from '../consts';

const {drawingModes} = consts;
const components = consts.componentNames;

/**
 * BlurMode class
 * @class
 * @ignore
 */
class BlurMode extends DrawingMode {
    constructor() {
        super(drawingModes.BLUR);
    }

    /**
    * start this drawing mode
    * @param {Graphics} graphics - Graphics instance
    * @param {{width: ?number, color: ?string}} [options] - Brush width & color
    * @override
    */
    start(graphics, options) {
        const blur = graphics.getComponent(components.BLUR);
        blur.start(options);
    }

    /**
     * stop this drawing mode
     * @param {Graphics} graphics - Graphics instance
     * @override
     */
    end(graphics) {
        const blur = graphics.getComponent(components.BLUR);
        blur.end();
    }
}

module.exports = BlurMode;
