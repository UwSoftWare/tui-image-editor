/**
 * @author Sabinaya KC <kc.sabinaya@gmail.com>
 * @fileoverview Zoom an image
 */
import commandFactory from '../factory/command';
import consts from '../consts';

const {componentNames, commandNames} = consts;
const {RESIZE} = componentNames;

const command = {
    name: commandNames.RESIZE_IMAGE,

    /**
     * Resize an image
     * @param {Graphics} graphics - Graphics instance
     * @param {string} type - 'resize'
     * @param {object} dimensions - Image Dimensions
     * @param {boolean} reset - zoom reset
     * @param {Array} transform - Zoom Transform Value
     * @returns {Promise}
     */
    execute(graphics, type, dimensions) {
        const resizeComp = graphics.getComponent(RESIZE);

        this.undoData.dimensions = resizeComp.getCurrentDimensions();

        return resizeComp[type](dimensions);
    },
    /**
     * @param {Graphics} graphics - Graphics instance
     * @returns {Promise}
     */
    undo(graphics) {
        const resizeComp = graphics.getComponent(RESIZE);

        return resizeComp.resize(this.undoData.dimensions);
    }
};

commandFactory.register(command);

module.exports = command;
