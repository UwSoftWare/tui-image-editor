import Range from './tools/range';
import Submenu from './submenuBase';
import templateHtml from './template/submenu/zoom';
import {toInteger, assignmentForDestroy} from '../util';

const defaultShapeStrokeValus = {
    realTimeEvent: true,
    min: 1,
    max: 5,
    useDecimal: false,
    value: 1
};

/**
 * Shape ui class
 * @class
 * @ignore
 */
class Zoom extends Submenu {
    constructor(subMenuElement, {locale, makeSvgIcon, menuBarPosition, usageStatistics}) {
        super(subMenuElement, {
            locale,
            name: 'zoom',
            makeSvgIcon,
            menuBarPosition,
            templateHtml,
            usageStatistics
        });

        this._els = {
            strokeRange: new Range({
                slider: this.selector('.tie-zoom-range'),
                input: this.selector('.tie-zoom-range-value')
            }, defaultShapeStrokeValus)
        };
    }

    /**
     * Destroys the instance.
     */
    destroy() {
        this._removeEvent();
        this._els.strokeRange.destroy();

        assignmentForDestroy(this);
    }

    /**
     * Add event for shape
     * @param {Object} actions - actions for shape
     *   @param {Function} actions.changeShape - change shape mode
     *   @param {Function} actions.setDrawingShape - set dreawing shape
     */
    addEvent(actions) {
        this.actions = actions;
        this._els.strokeRange.on('change', this._debounce(this._changeStrokeRangeHandler.bind(this), 500));
    }

    /**
     * Remove event
     * @private
     */
    _removeEvent() {
        this._els.strokeRange.off();
    }

    /**
     * Executed when the menu starts.
     */
    changeStartMode() {
    }

    /**
     * Returns the menu to its default state.
     */
    changeStandbyMode() {
    }

    /**
     * set range stroke max value
     * @param {number} maxValue - expect max value for change
     */
    setMaxStrokeValue(maxValue) {
        let strokeMaxValue = maxValue;
        if (strokeMaxValue <= 0) {
            strokeMaxValue = defaultShapeStrokeValus.max;
        }
        this._els.strokeRange.max = strokeMaxValue;
    }

    /**
     * Set stroke value
     * @param {number} value - expect value for strokeRange change
     */
    setStrokeValue(value) {
        this._els.strokeRange.value = value;
        this._els.strokeRange.trigger('change');
    }

    /**
     * Get stroke value
     * @returns {number} - stroke range value
     */
    getStrokeValue() {
        return this._els.strokeRange.value;
    }

    /**
     * Change stroke range
     * @param {number} value - stroke range value
     * @param {boolean} isLast - Is last change
     * @private
     */
    _changeStrokeRangeHandler(value) {
        const strokeWidth = toInteger(value);
        this.actions.setZoomValue(strokeWidth);
    }

    _debounce(func, delay) {
        let inDebounce;

        return (...args) => {
            clearTimeout(inDebounce);
            inDebounce = setTimeout(() => func.apply(this, args), delay);
        };
    }
}

export default Zoom;
