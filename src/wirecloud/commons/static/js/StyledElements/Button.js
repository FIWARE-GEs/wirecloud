/*
 *     Copyright (c) 2008-2016 CoNWeT Lab., Universidad Politécnica de Madrid
 *     Copyright (c) 2020-2021 Future Internet Consulting and Development Solutions S.L.
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

/* globals StyledElements */


(function (se, utils) {

    "use strict";

    const defaults = {
        id: "",
        class: "",
        iconClass: "",
        stackedIconClass: "",
        state: "",
        plain: false,
        usedInForm: false,
        text: "",
        depth: null,
        title: "",
        stackedIconPlacement: "bottom-right",
        tabindex: 0
    };
    Object.freeze(defaults);

    const prop_state_get = function prop_state_get(state) {
        return state;
    };

    const prop_state_set = function prop_state_set(state, newState) {
        const states = ["default", "primary", "success", "info", "warning", "danger"];

        if (states.indexOf(newState) !== -1) {
            if (newState !== state) {
                if (state) {
                    this.removeClassName("btn-" + state);
                }
                state = newState;
                this.addClassName("btn-" + state);
            }
        } else {
            if (state) {
                this.removeClassName("btn-" + state);
            }
            state = "";
        }

        return state;
    };

    const prop_depth_set = function prop_depth_set(depth, newDepth) {

        if (typeof newDepth === "number" && newDepth >= 0 && newDepth <= 5) {
            if (newDepth !== depth) {
                if (depth >= 0) {
                    this.removeClassName("z-depth-" + depth);
                }
                depth = newDepth;
                this.addClassName("z-depth-" + depth);
            }
        } else {
            if (depth != null) {
                this.removeClassName("z-depth-" + depth);
            }
            depth = null;
        }

        return depth;
    };

    const removeLabel = function removeLabel() {

        if (this.label != null) {
            this.label.remove();
            this.label = null;
        }

        return this;
    };

    const addLabel = function addLabel(textContent) {

        if (this.label == null) {
            this.label = document.createElement("span");
            this.wrapperElement.appendChild(this.label);
        }

        this.label.textContent = textContent;

        return this;
    };

    const insertBadge = function insertBadge(content, state, isAlert) {
        const states = ["inverse", "primary", "success", "info", "warning", "danger"];

        if (this.badgeElement == null) {
            this.badgeElement = document.createElement("span");
            this.wrapperElement.insertBefore(this.badgeElement, this.wrapperElement.firstChild);
        }

        this.badgeElement.className = "badge";
        if (states.indexOf(state) !== -1) {
            this.badgeElement.classList.add("badge-" + state);
        }
        this.badgeElement.classList.add("z-depth-" + (this.depth + 1));
        this.toggleClassName("has-alert", isAlert);
        this.badgeElement.textContent = content;

        return this;
    };

    const removeBadge = function removeBadge() {

        if (this.badgeElement != null) {
            this.badgeElement.remove();
            this.badgeElement = null;
        }

        this.removeClassName("has-alert");

        return this;
    };

    const clickCallback = function clickCallback(e) {
        if (this.inputElement != null && e.target === this.inputElement) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        if (this.enabled) {
            if (this.inputElement != null) {
                this.inputElement.click();
            }
            this.dispatchEvent("click");
        }
    };

    const dblclickCallback = function dblclickCallback(e) {
        e.preventDefault();
        e.stopPropagation();
        if (this.enabled) {
            this.dispatchEvent("dblclick");
        }
    };

    const element_onkeydown = function element_onkeydown(event) {
        if (this.enabled) {
            const modifiers = utils.extractModifiers(event);
            modifiers.preventDefault = event.preventDefault.bind(event);
            modifiers.stopPropagation = event.stopPropagation.bind(event);
            this._onkeydown(modifiers, utils.normalizeKey(event));
        }
    };

    const onmouseenter = function onmouseenter() {
        this.dispatchEvent("mouseenter");
    };

    const onmouseleave = function onmouseleave() {
        this.dispatchEvent("mouseleave");
    };

    const onfocus = function onfocus() {
        this.dispatchEvent("focus");
    };

    const onblur = function onblur() {
        this.dispatchEvent("blur");
    };

    const update_tabindex = function update_tabindex() {
        if (this.enabled) {
            this.wrapperElement.setAttribute("tabindex", this.tabindex);
        } else {
            this.wrapperElement.setAttribute("tabindex", -1);
        }
    };

    /**
     *
     * Eventos que soporta este componente:
     *      - click: evento lanzado cuando se pulsa el botón.
     */
    se.Button = class Button extends se.StyledElement {

        constructor(options) {
            options = utils.merge(utils.clone(defaults), options);

            super(["blur", "click", "dblclick", "focus", "mouseenter", "mouseleave"]);

            if (options.usedInForm) {
                this.wrapperElement = document.createElement("button");
                this.wrapperElement.setAttribute("type", "button");
            } else {
                this.wrapperElement = document.createElement("div");
            }

            this.wrapperElement.className = "se-btn";
            this.label = null;
            this.icon = null;
            this.badgeElement = null;
            this.tooltip = null;

            this.addClassName(options.class);

            if (options.id.trim() !== "") {
                this.wrapperElement.setAttribute("id", options.id);
            }

            if (options.plain) {
                this.addClassName("plain");
            }

            // Set initial label, icon and tooltip
            this.addIconClassName(options.iconClass);
            this.setLabel(options.text);
            this.setTitle(options.title);

            if (options.iconClass && options.stackedIconClass) {
                this.stackedIcon = document.createElement("span");
                this.stackedIcon.className = [options.stackedIconClass, "se-stacked-icon", options.stackedIconPlacement].join(" ");
                this.icon.appendChild(this.stackedIcon);
            }

            /* Properties */
            let tabindex, state, depth;
            Object.defineProperties(this, {

                /**
                 * Get or set the z-depth effect value.
                 *
                 * @memberof StyledElements.Button#
                 * @since 0.7.0
                 *
                 * @type {?Number}
                 */
                depth: {
                    get: function get() {
                        return depth;
                    },
                    set: function set(newDepth) {
                        depth = prop_depth_set.call(this, depth, newDepth);
                    }
                },

                /**
                 * Get or set the contextual state class.
                 *
                 * @memberof StyledElements.Button#
                 * @since 0.7.0
                 *
                 * @type {?String}
                 */
                state: {
                    get: function get() {
                        return prop_state_get.call(this, state);
                    },
                    set: function set(newState) {
                        state = prop_state_set.call(this, state, newState);
                    }
                },

                tabindex: {
                    get: function get() {
                        return tabindex;
                    },
                    set: function set(new_tabindex) {
                        tabindex = new_tabindex;
                        update_tabindex.call(this);
                    }
                }
            });

            /* Initial status */
            this.state = options.state;
            this.depth = options.depth;
            this.tabindex = options.tabindex;

            /* Event handlers */
            const prototype = Object.getPrototypeOf(this);
            if (typeof prototype._clickCallback === "function") {
                this._clickCallback = prototype._clickCallback.bind(this);
            } else {
                this._clickCallback = clickCallback.bind(this);
            }
            this._onkeydown_bound = element_onkeydown.bind(this);

            this.wrapperElement.addEventListener("touchstart", StyledElements.Utils.stopPropagationListener, true);
            this.wrapperElement.addEventListener("mousedown", StyledElements.Utils.stopPropagationListener, true);
            this.wrapperElement.addEventListener("click", this._clickCallback, false);
            this.wrapperElement.addEventListener("dblclick", dblclickCallback.bind(this), true);
            this.wrapperElement.addEventListener("keydown", this._onkeydown_bound, false);
            this.wrapperElement.addEventListener("focus", onfocus.bind(this), true);
            this.wrapperElement.addEventListener("blur", onblur.bind(this), true);
            this.wrapperElement.addEventListener("mouseenter", onmouseenter.bind(this), false);
            this.wrapperElement.addEventListener("mouseleave", onmouseleave.bind(this), false);
        }

        /**
         * @override
         */
        _onenabled(enabled) {
            update_tabindex.call(this);

            if (!enabled) {
                this.blur();
            }

            return this;
        }

        /**
         * @override
         */
        _onkeydown(event, key) {
            switch (key) {
            case " ":
            case "Enter":
                this._clickCallback(event);
                break;
            default:
                // Quit when this doesn't handle the key event.
                break;
            }
        }

        focus() {
            this.wrapperElement.focus();
            return this;
        }

        blur() {
            this.wrapperElement.blur();
            return this;
        }

        /**
         * Sets the label of the button. If `text` is empty, any label currently
         * used by the button will be removed.
         *
         * @since 0.6.0
         *
         * @param {String} [text]
         *      Text to use as the label of the button
         * @returns {Button}
         *      The instance on which the member is called.
         */
        setLabel(text) {
            return text ? addLabel.call(this, text) : removeLabel.call(this);
        }

        /**
         * Returns `true` if this Button is usig the CSS class name
         * `className` for the icon element, otherwise `false`
         *
         * @param {String} className
         *      A class name to search for.
         * @returns {Boolean}
         *      `true` if this Button is usig the CSS class name `className` for the
         *      icon element, otherwise `false`
         */
        hasIconClassName(className) {
            className = className == null ? "" : className.toString().trim();

            return this.icon != null && this.icon.classList.contains(className);
        }

        addIconClassName(classList) {
            if (!Array.isArray(classList)) {
                classList = classList == null ? "" : classList.toString().trim();
                if (classList === "") {
                    return this;
                }
                classList = classList.split(/\s+/);
            }

            if (classList.length === 0) {
                // Nothing to do
                return this;
            } else if (this.icon == null) {
                this.icon = document.createElement("i");
                this.icon.classList.add("se-icon");
                this.wrapperElement.appendChild(this.icon);
            }

            classList.forEach(function (classname) {
                this.icon.classList.add(classname);
            }, this);

            return this;
        }

        removeIconClassName(classList) {
            if (this.icon == null) {
                // Nothing to do
                return this;
            }

            if (!Array.isArray(classList)) {
                classList = classList == null ? "" : classList.toString().trim();
                if (classList === "") {
                    this.icon.remove();
                    this.icon = null;
                    return this;
                }
                classList = classList.split(/\s+/);
            }

            classList.forEach(function (classname) {
                this.icon.classList.remove(classname);
            }, this);

            if (this.icon.className.trim() === "se-icon") {
                this.icon.remove();
                this.icon = null;
            }

            return this;
        }

        replaceIconClassName(className, newClassName) {
            this.removeIconClassName(className);
            return this.addIconClassName(newClassName);
        }

        setTitle(title) {
            if (title == null || title === "") {
                if (this.tooltip != null) {
                    this.tooltip.destroy();
                    this.tooltip = null;
                }
            } else {
                if (this.tooltip == null) {
                    this.tooltip = new this.Tooltip({content: title, placement: ["bottom", "top", "right", "left"]});
                    this.tooltip.bind(this);
                }
                this.tooltip.options.content = title;
            }

            return this;
        }

        click() {
            if (this.enabled) {
                this.dispatchEvent("click");
            }
            return this;
        }

        destroy() {

            this.wrapperElement.removeEventListener("touchstart", StyledElements.Utils.stopPropagationListener, true);
            this.wrapperElement.removeEventListener("mousedown", StyledElements.Utils.stopPropagationListener, true);
            this.wrapperElement.removeEventListener("click", this._clickCallback, true);
            this.wrapperElement.removeEventListener("keydown", this._onkeydown_bound, false);

            delete this._clickCallback;
            delete this._onkeydown_bound;

            StyledElements.StyledElement.prototype.destroy.call(this);
        }

        /**
         * Set a badge on the button to highlight new or unread items.
         * @since 0.7.0
         *
         * @param {String|Number} content The badge's textContent.
         * @param {String} [state] The badge's contextual state class.
         * @param {Boolean} [isAlert] Set the button more eye-catching.
         *
         * @returns {StyledElements.Button} The instance on which this method is called.
         */
        setBadge(content, state, isAlert) {
            return content ? insertBadge.call(this, content, state, !!isAlert) : removeBadge.call(this);
        }

    }

    se.Button.prototype.Tooltip = StyledElements.Tooltip;

})(StyledElements, StyledElements.Utils);
