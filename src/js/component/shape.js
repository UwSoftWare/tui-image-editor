/**
 * @author NHN Ent. FE Development Team <dl_javascript@nhn.com>
 * @fileoverview Shape component
 */
import fabric from 'fabric';
import Promise from 'core-js/library/es6/promise';
import Component from '../interface/component';
import consts from '../consts';
import resizeHelper from '../helper/shapeResizeHelper';
import {extend, inArray} from 'tui-code-snippet';

const {rejectMessages, eventNames, SHAPE_DEFAULT_OPTIONS} = consts;
const KEY_CODES = consts.keyCodes;
const SHAPE_INIT_OPTIONS = extend({
    strokeWidth: 90,
    stroke: '#000000',
    fill: '#ffffff',
    width: 1,
    height: 1,
    rx: 0,
    ry: 0
}, SHAPE_DEFAULT_OPTIONS);
const DEFAULT_TYPE = 'arrow';
const DEFAULT_WIDTH = 20;
const DEFAULT_HEIGHT = 20;

const shapeType = ['rect', 'circle', 'triangle', 'arrow', 'polyline'];

/**
 * Shape
 * @class Shape
 * @param {Graphics} graphics - Graphics instance
 * @extends {Component}
 * @ignore
 */
class Shape extends Component {
    constructor(graphics) {
        super(consts.componentNames.SHAPE, graphics);

        /**
         * Object of The drawing shape
         * @type {fabric.Object}
         * @private
         */
        this._shapeObj = null;

        /**
         * Type of the drawing shape
         * @type {string}
         * @private
         */
        this._type = DEFAULT_TYPE;

        /**
         * Options to draw the shape
         * @type {Object}
         * @private
         */
        this._options = extend({}, SHAPE_INIT_OPTIONS);

        /**
         * Whether the shape object is selected or not
         * @type {boolean}
         * @private
         */
        this._isSelected = false;

        /**
         * Pointer for drawing shape (x, y)
         * @type {Object}
         * @private
         */
        this._startPoint = {};

        /**
         * Using shortcut on drawing shape
         * @type {boolean}
         * @private
         */
        this._withShiftKey = false;

        /**
         * Event handler list
         * @type {Object}
         * @private
         */
        this._handlers = {
            mousedown: this._onFabricMouseDown.bind(this),
            mousemove: this._onFabricMouseMove.bind(this),
            mouseup: this._onFabricMouseUp.bind(this),
            keydown: this._onKeyDown.bind(this),
            keyup: this._onKeyUp.bind(this)
        };
    }

    /**
     * Start to draw the shape on canvas
     * @ignore
     */
    start() {
        const canvas = this.getCanvas();

        this._isSelected = false;

        canvas.defaultCursor = 'crosshair';
        canvas.selection = false;
        canvas.uniScaleTransform = true;
        canvas.on({
            'mouse:down': this._handlers.mousedown
        });

        fabric.util.addListener(document, 'keydown', this._handlers.keydown);
        fabric.util.addListener(document, 'keyup', this._handlers.keyup);
    }

    /**
     * End to draw the shape on canvas
     * @ignore
     */
    end() {
        const canvas = this.getCanvas();

        this._isSelected = false;

        canvas.defaultCursor = 'default';

        canvas.uniScaleTransform = false;
        canvas.off({
            'mouse:down': this._handlers.mousedown
        });

        fabric.util.removeListener(document, 'keydown', this._handlers.keydown);
        fabric.util.removeListener(document, 'keyup', this._handlers.keyup);
    }

    /**
     * Set states of the current drawing shape
     * @ignore
     * @param {string} type - Shape type (ex: 'rect', 'circle')
     * @param {Object} [options] - Shape options
     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
     *      @param {string} [options.stoke] - Shape outline color
     *      @param {number} [options.strokeWidth] - Shape outline width
     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
     */
    setStates(type, options) {
        this._type = type;

        if (options) {
            this._options = extend(this._options, options);
        }
    }

    /**
     * Add the shape
     * @ignore
     * @param {string} type - Shape type (ex: 'rect', 'circle')
     * @param {Object} options - Shape options
     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
     *      @param {string} [options.stroke] - Shape outline color
     *      @param {number} [options.strokeWidth] - Shape outline width
     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
     *      @param {number} [options.isRegular] - Whether scaling shape has 1:1 ratio or not
     * @returns {Promise}
     */
    add(type, options) {
        return new Promise(resolve => {
            const canvas = this.getCanvas();
            options = this._extendOptions(options);

            const shapeObj = this._createInstance(type, options);

            this._bindEventOnShape(shapeObj);

            canvas.add(shapeObj).setActiveObject(shapeObj);

            const objectProperties = this.graphics.createObjectProperties(shapeObj);

            resolve(objectProperties);
        });
    }

    /**
     * Change the shape
     * @ignore
     * @param {fabric.Object} shapeObj - Selected shape object on canvas
     * @param {Object} options - Shape options
     *      @param {string} [options.fill] - Shape foreground color (ex: '#fff', 'transparent')
     *      @param {string} [options.stroke] - Shape outline color
     *      @param {number} [options.strokeWidth] - Shape outline width
     *      @param {number} [options.width] - Width value (When type option is 'rect', this options can use)
     *      @param {number} [options.height] - Height value (When type option is 'rect', this options can use)
     *      @param {number} [options.rx] - Radius x value (When type option is 'circle', this options can use)
     *      @param {number} [options.ry] - Radius y value (When type option is 'circle', this options can use)
     *      @param {number} [options.isRegular] - Whether scaling shape has 1:1 ratio or not
     * @returns {Promise}
     */
    change(shapeObj, options) {
        return new Promise((resolve, reject) => {
            if (inArray(shapeObj.get('type'), shapeType) < 0) {
                reject(rejectMessages.unsupportedType);
            }

            shapeObj.set(options);
            this.getCanvas().renderAll();
            resolve();
        });
    }

    /**
     * Create the instance of shape
     * @param {string} type - Shape type
     * @param {Object} options - Options to creat the shape
     * @returns {fabric.Object} Shape instance
     * @private
     */
    _createInstance(type, options) {
        let instance;

        switch (type) {
            case 'rect':
                instance = new fabric.Rect(options);
                break;
            case 'circle':
                instance = new fabric.Ellipse(extend({
                    type: 'circle'
                }, options));
                break;
            case 'triangle':
                instance = new fabric.Triangle(options);
                break;
            case 'arrow':
                instance = this._createArrow(options.startX, options.startY, options.endX, options.endY, options);
                break;
            default:
                instance = {};
        }

        return instance;
    }

    /**
     * Get the options to create the shape
     * @param {Object} options - Options to creat the shape
     * @returns {Object} Shape options
     * @private
     */
    _extendOptions(options) {
        const selectionStyles = consts.fObjectOptions.SELECTION_STYLE;

        options = extend({}, SHAPE_INIT_OPTIONS, this._options, selectionStyles, options);

        if (options.isRegular) {
            options.lockUniScaling = true;
        }

        return options;
    }

    /**
     * Bind fabric events on the creating shape object
     * @param {fabric.Object} shapeObj - Shape object
     * @private
     */
    _bindEventOnShape(shapeObj) {
        const self = this;
        const canvas = this.getCanvas();

        shapeObj.on({
            added() {
                self._shapeObj = this;
                resizeHelper.setOrigins(self._shapeObj);
            },
            selected() {
                self._isSelected = true;
                self._shapeObj = this;
                canvas.uniScaleTransform = true;
                canvas.defaultCursor = 'default';
                resizeHelper.setOrigins(self._shapeObj);
            },
            deselected() {
                self._isSelected = false;
                self._shapeObj = null;
                canvas.defaultCursor = 'crosshair';
                canvas.uniScaleTransform = false;
            },
            modified() {
                const currentObj = self._shapeObj;

                resizeHelper.adjustOriginToCenter(currentObj);
                resizeHelper.setOrigins(currentObj);
            },
            scaling(fEvent) {
                const pointer = canvas.getPointer(fEvent.e);
                const currentObj = self._shapeObj;

                canvas.setCursor('crosshair');
                resizeHelper.resize(currentObj, pointer, true);
            }
        });
    }

    /**
     * MouseDown event handler on canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
     * @private
     */
    _onFabricMouseDown(fEvent) {
        if (!fEvent.target) {
            this._isSelected = false;
            this._shapeObj = false;
        }

        if (!this._isSelected && !this._shapeObj) {
            const canvas = this.getCanvas();
            this._startPoint = canvas.getPointer(fEvent.e);

            canvas.on({
                'mouse:move': this._handlers.mousemove,
                'mouse:up': this._handlers.mouseup
            });
        }
    }

    /**
     * MouseDown event handler on canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
     * @private
     */
    _onFabricMouseMove(fEvent) {
        const canvas = this.getCanvas();
        const pointer = canvas.getPointer(fEvent.e);
        const startPointX = this._startPoint.x;
        const startPointY = this._startPoint.y;
        const width = startPointX - pointer.x;
        const height = startPointY - pointer.y;
        const shape = this._shapeObj;

        if (!shape && this._type !== 'arrow') {
            this.add(this._type, {
                left: startPointX,
                top: startPointY,
                width,
                height
            }).then(objectProps => {
                this.fire(eventNames.ADD_OBJECT, objectProps);
            });
        } else if (this._type !== 'arrow') {
            this._shapeObj.set({
                isRegular: this._withShiftKey
            });

            resizeHelper.resize(shape, pointer);
            canvas.renderAll();
        }
    }

    /**
     * MouseUp event handler on canvas
     * @param {{target: fabric.Object, e: MouseEvent}} fEvent - Fabric event object
     * @private
     */
    _onFabricMouseUp(fEvent) {
        const canvas = this.getCanvas();
        const startPointX = this._startPoint.x;
        const startPointY = this._startPoint.y;
        const shape = this._shapeObj;
        const pointer = canvas.getPointer(fEvent.e);
        if (!shape) {
            let data = {};
            if (this._type === 'arrow') {
                if (this._startPoint.x === pointer.x && this._startPoint.y === pointer.y) {
                    return;
                }

                data = {
                    startX: this._startPoint.x,
                    startY: this._startPoint.y,
                    endX: pointer.x,
                    endY: pointer.y,
                    originX: 'left',
                    originY: 'top'
                };
            } else {
                data = {
                    left: startPointX,
                    top: startPointY,
                    width: DEFAULT_WIDTH,
                    height: DEFAULT_HEIGHT
                };
            }

            if (data.width < 2 && data.height < 2) {
                return;
            }

            this.add(this._type, data).then(objectProps => {
                this.fire(eventNames.ADD_OBJECT_AFTER, objectProps);
            });
        } else if (shape) {
            resizeHelper.adjustOriginToCenter(shape);
            this.fire(eventNames.ADD_OBJECT_AFTER, this.graphics.createObjectProperties(shape));
        }

        canvas.off({
            'mouse:move': this._handlers.mousemove,
            'mouse:up': this._handlers.mouseup
        });
    }

    /**
     * Keydown event handler on document
     * @param {KeyboardEvent} e - Event object
     * @private
     */
    _onKeyDown(e) {
        if (e.keyCode === KEY_CODES.SHIFT) {
            this._withShiftKey = true;

            if (this._shapeObj) {
                this._shapeObj.isRegular = true;
            }
        }
    }

    /**
     * Keyup event handler on document
     * @param {KeyboardEvent} e - Event object
     * @private
     */
    _onKeyUp(e) {
        if (e.keyCode === KEY_CODES.SHIFT) {
            this._withShiftKey = false;

            if (this._shapeObj) {
                this._shapeObj.isRegular = false;
            }
        }
    }

    /**
     * Create an Arrow shape using Polyline 
     * @param {object} fromx - Starting X Coordinate
     * @param {object} fromy - Starting Y Coordinate
     * @param {object} tox - Ending X Coordinate
     * @param {object} toy - Ending Y Coordinate
     * @param {object} options - Arrow options
     * @returns {fabric.Polyline} Fabric Polyline
     * @private
     */
    _createArrow(fromx, fromy, tox, toy, options) {
        const angle = Math.atan2(toy - fromy, tox - fromx);
        const headlen = 15;
        // bring the line end back some to account for arrow head.
        tox = tox - (headlen * Math.cos(angle));
        toy = toy - (headlen * Math.sin(angle));
        // calculate the points.
        const points = [
            {
                x: fromx,
                y: fromy
            }, {
                x: fromx - ((headlen / 4) * (Math.cos(angle - (Math.PI / 2)))),
                y: fromy - ((headlen / 4) * (Math.sin(angle - (Math.PI / 2))))
            }, {
                x: tox - ((headlen / 4) * (Math.cos(angle - (Math.PI / 2)))),
                y: toy - ((headlen / 4) * (Math.sin(angle - (Math.PI / 2))))
            }, {
                x: tox - ((headlen) * (Math.cos(angle - (Math.PI / 2)))),
                y: toy - ((headlen) * (Math.sin(angle - (Math.PI / 2))))
            }, {
                x: tox + ((headlen) * Math.cos(angle)),
                y: toy + ((headlen) * Math.sin(angle))
            }, {
                x: tox - ((headlen) * (Math.cos(angle + (Math.PI / 2)))),
                y: toy - ((headlen) * (Math.sin(angle + (Math.PI / 2))))
            }, {
                x: tox - ((headlen / 4) * (Math.cos(angle + (Math.PI / 2)))),
                y: toy - ((headlen / 4) * (Math.sin(angle + (Math.PI / 2))))
            }, {
                x: fromx - ((headlen / 4) * (Math.cos(angle + (Math.PI / 2)))),
                y: fromy - ((headlen / 4) * (Math.sin(angle + (Math.PI / 2))))
            }, {
                x: fromx,
                y: fromy
            }
        ];
        const pline = new fabric.Polyline(points, options);

        return pline;
    }
}

module.exports = Shape;
