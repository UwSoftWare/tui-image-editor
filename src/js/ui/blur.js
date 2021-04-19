import util from '../util';
import Range from './tools/range';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/blur';
import {defaultBlurRangeValus} from '../consts';

/**
 * Blur ui class
 * @class
 * @ignore
 */
class Blur extends Submenu {
    constructor(subMenuElement, {locale, makeSvgIcon, menuBarPosition, usageStatistics}) {
        super(subMenuElement, {
            locale,
            name: 'blur',
            makeSvgIcon,
            menuBarPosition,
            templateHtml,
            usageStatistics
        });

        this._els = {
            drawRange: new Range({
                slider: this.selector('.tie-blur-range'),
                input: this.selector('.tie-blur-range-value')
            }, defaultBlurRangeValus)
        };

        this.width = this._els.drawRange.value;
    }

    /**
     * Destroys the instance.
     */
    destroy() {
        this._removeEvent();
        this._els.drawRange.destroy();

        util.assignmentForDestroy(this);
    }

    /**
     * Add event for draw
     * @param {Object} actions - actions for crop
     *   @param {Function} actions.setDrawMode - set draw mode
     */
    addEvent(actions) {
        this.actions = actions;
        this._els.drawRange.on('change', this._changeDrawRange.bind(this));
    }

    /**
     * Remove event
     * @private
     */
    _removeEvent() {
        this._els.drawRange.off();
    }

    /**
     * set draw mode - action runner
     */
    setDrawMode() {
        // eslint-disable-next-line no-console
        console.log('setBlurMode');
        this.actions.setBlurMode({
            width: this.width
        });
    }

    /**
     * Returns the menu to its default state.
     */
    changeStandbyMode() {
        this.actions.stopDrawingMode();
        this.actions.changeSelectableAll(true);
    }

    /**
     * Executed when the menu starts.
     */
    changeStartMode() {
        this.setDrawMode();
    }

    /**
     * Change drawing Range
     * @param {number} value - select drawing range
     * @private
     */
    _changeDrawRange(value) {
        this.width = value;
        this.changeStartMode();
    }
}

export default Blur;
