/*
 *     (C) Copyright 2012 Universidad Politécnica de Madrid
 *
 *     This file is part of Wirecloud Platform.
 *
 *     Wirecloud Platform is free software: you can redistribute it and/or
 *     modify it under the terms of the GNU Affero General Public License as
 *     published by the Free Software Foundation, either version 3 of the
 *     License, or (at your option) any later version.
 *
 *     Wirecloud is distributed in the hope that it will be useful, but WITHOUT
 *     ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 *     FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public
 *     License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with Wirecloud Platform.  If not, see
 *     <http://www.gnu.org/licenses/>.
 *
 */

/*jshint forin:true, eqnull:true, noarg:true, noempty:true, eqeqeq:true, bitwise:true, undef:true, curly:true, browser:true, indent:4, maxerr:50, prototypejs: true */
/*global Coordinates, CSSPrimitiveValue, BrowserUtilsFactory, StyledElements, Wirecloud */


(function () {

    "use strict";

    /*************************************************************************
     * Constructor Anchor
     *************************************************************************/
    /**
     * An anchor is represented by a checkbox and used as target or source of arrows.
     *
     * @abstract
     */
    var Anchor = function Anchor(extending, arrowCreator) {
        if (extending === true) {
            return;
        }
        StyledElements.StyledElement.call(this, ['startdrag', 'enddrag']);

        this.arrows = [];

        this.wrapperElement = document.createElement("div");
        this.wrapperElement.className = 'anchor';
        this.wrapperElement.addEventListener('mousedown', function (e) {
            if (this.enabled && BrowserUtilsFactory.getInstance().isLeftButton(e.button)) {
                arrowCreator.startdrag(e, this);
                this.events.startdrag.dispatch(this);
            }
        }.bind(this));

        this.wrapperElement.addEventListener('mouseup', function (e) {
            if (this.enabled && BrowserUtilsFactory.getInstance().isLeftButton(e.button)) {
                e.stopPropagation();
                arrowCreator.enddrag(e, this);
                this.events.enddrag.dispatch(this);
            }
        }.bind(this));
    };
    Anchor.prototype = new StyledElements.StyledElement();

    /*************************************************************************
     * Private methods
     *************************************************************************/

    /*************************************************************************
     * Public methods
     *************************************************************************/

    /**
     * Retrieves the coordinates of this anchor relative to another HTML Element.
     *
     * @param {HTMLElement} baseElement element of reference.
     */
    Anchor.prototype.getCoordinates = function getCoordinates(baseElement) {
        var coordinates = {posX: this.wrapperElement.offsetLeft,
                           posY: this.wrapperElement.offsetTop};
        var parentNode = this.wrapperElement.parentNode;
        while (parentNode !== baseElement) {
            var cssStyle = document.defaultView.getComputedStyle(parentNode, null);
            var p = cssStyle.getPropertyValue('position');
            if (p !== 'static') {
                coordinates.posY += parentNode.offsetTop + cssStyle.getPropertyCSSValue('border-top-width').getFloatValue(CSSPrimitiveValue.CSS_PX);
                coordinates.posX += parentNode.offsetLeft + cssStyle.getPropertyCSSValue('border-left-width').getFloatValue(CSSPrimitiveValue.CSS_PX);
            }
            parentNode = parentNode.parentNode;
        }

        return {
            posX: Math.round(coordinates.posX + (this.wrapperElement.offsetWidth / 2)),
            posY: Math.round(coordinates.posY + (this.wrapperElement.offsetWidth / 2))
        };
    };

    /**
     * Retrieves the coordinates of the anchor center.
     * @return {Coordinates}
     */
    Anchor.prototype.getAnchorCenter = function getAnchorCenter() {
        var coordinates = {posX: this.htmlElement.offsetLeft,
                           posY: this.htmlElement.offsetTop};
        return new Coordinates(coordinates, this.htmlElement.offsetWidth, this.htmlElement.offsetHeight);
    };

    /**
     * @return {Boolean}
     */
    Anchor.prototype.isConnected = function isConnected() {
        return this.connectionArrows.length > 0;
    };

    /**
     * @addArrow
     */
    Anchor.prototype.addArrow = function addArrow(theArrow) {
        this.arrows.push(theArrow);
    };

    /**
     * @addArrow
     */
    Anchor.prototype.removeArrow = function removeArrow(theArrow) {
        var index = this.arrows.indexOf(theArrow);

        if (index !== -1) {
            this.arrows.splice(index, 1);
        }
    };

    /*************************************************************************
     * Make Anchor public
     *************************************************************************/
    Wirecloud.ui.WiringEditor.Anchor = Anchor;
})();
