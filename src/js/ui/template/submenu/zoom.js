/**
 * @param {Object} submenuInfo - submenu info for make template
 *   @param {Locale} locale - Translate text
 *   @param {Function} makeSvgIcon - svg icon generator
 * @returns {string}
 */
export default () => (`
    <ul class="tui-image-editor-submenu-item">
        <li class="tui-image-editor-newline tui-image-editor-range-wrap">
            <label class="range">Zoom</label>
            <div class="tie-zoom-range"></div>
            <input class="tie-zoom-range-value tui-image-editor-range-value" value="0" />
        </li>
    </ul>
`);
