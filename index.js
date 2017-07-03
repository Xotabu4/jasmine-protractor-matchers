"use strict";
exports.__esModule = true;
var argumentsToObject = require('arguejs'); // Nice! https://github.com/zvictor/ArgueJS
var Matcher = (function () {
    function Matcher(options) {
        this.options = options;
    }
    Matcher.prototype.build = function () {
        var _this = this;
        var jasmineFormattedMatcher = {
            compare: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                var argumentsObject = _this.prepareArgumentsObject(args);
                return _this.options.compareFunc(argumentsObject);
            },
            negativeCompare: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (_this.options.negativeCompareFunc === undefined) {
                    var funcName = _this.options.compareFunc.name;
                    throw Error("Matcher " + funcName + " does not supports negation with .not()");
                }
                var argumentsObject = _this.prepareArgumentsObject(args);
                return _this.options.negativeCompareFunc(argumentsObject);
            }
        };
        // Requires to be a function
        return function () { return jasmineFormattedMatcher; };
    };
    Matcher.prototype.prepareArgumentsObject = function (args) {
        var elem = args[0];
        this.assertElementFinder(elem);
        var browsr = this.extractBrowserFromElementFinder(elem);
        args.splice(1, 0, browsr); // Injecting 'browser' to second position
        return argumentsToObject(this.options.argumentsSignature, args);
    };
    Matcher.prototype.assertElementFinder = function (elem) {
        // TODO: Improve duck-type object verification with more attributes
        var isElementFinder = function (elem) {
            return elem && (elem.browser_ || elem.ptor_) && elem.getAttribute && elem.locator;
        };
        if (!isElementFinder(elem)) {
            throw new Error("Matcher expects to be applied to ElementFinder object, but got: " + JSON.stringify(elem) + " instead");
        }
    };
    Matcher.prototype.extractBrowserFromElementFinder = function (elem) {
        return elem.browser_ || elem.ptor_;
    };
    return Matcher;
}());
var Helpers = (function () {
    function Helpers() {
    }
    Helpers.hasClass = function (elem, classString) {
        return elem.getAttribute('class').then(function (classes) {
            // splitting to avoid false positive 'inactiveGrayed inactive'.indexOf('active') !== -1
            var classesArr = classes.split(' ');
            return classesArr.indexOf(classString) !== -1;
        }, function (err) {
            return false;
        });
    };
    Helpers.hasNoClass = function (elem, classString) {
        return Helpers.hasClass(elem, classString).then(function (res) { return !res; });
    };
    return Helpers;
}());
//////////////////////// EXPORT ////////////////////////
// Exporting matchers in format that applicable for Jasminejs to import.
exports["default"] = {
    /**
     * Matcher for asserting that element is present and visible.
     * Should be applied to ElementFinder object only.
     * Optional Parameters:
     * [timeout=3000] - Timeout to wait for appear of element in milliseconds.|
     * [message='Element ELEMENT_LOCATOR was expected to be shown in TIMEOUT milliseconds but is NOT visible'] Custom error message to throw on assertion failure.
     */
    toAppear: new Matcher({
        argumentsSignature: { elem: Object, browsr: Object, timeout: [Number, 3000], message: [String] },
        compareFunc: function (argsObj) {
            var result = {
                pass: undefined,
                message: undefined
            };
            result.pass = argsObj.browsr.wait(protractor.ExpectedConditions.visibilityOf(argsObj.elem), argsObj.timeout)
                .then(function () { return true; }, function (err) {
                result.message = argsObj.message || "Element " + argsObj.elem.locator() + " was expected to be shown in " + argsObj.timeout + " milliseconds but is NOT visible";
                return false;
            });
            return result;
        },
        negativeCompareFunc: function (argsObj) {
            // Identical to toDisappear() matcher
            var result = {
                pass: undefined,
                message: undefined
            };
            result.pass = argsObj.browsr.wait(protractor.ExpectedConditions.invisibilityOf(argsObj.elem), argsObj.timeout)
                .then(function () { return true; }, function (err) {
                result.message = argsObj.message || "Element " + argsObj.elem.locator() + " was expected NOT to be shown in " + argsObj.timeout + " milliseconds but is visible";
                return false;
            });
            return result;
        }
    }).build(),
    /**
     * Matcher for asserting that element is not displayed on the page.
     * Should be applied to ElementFinder object only.
     * Optional Parameters:
     * [timeout=3000] - Timeout to wait for disappear of element in milliseconds.|
     * [message='Element ELEMENT_LOCATOR was expected NOT to be shown in TIMEOUT milliseconds but is visible'] Custom error message to throw on assertion failure.
     */
    toDisappear: new Matcher({
        argumentsSignature: { elem: Object, browsr: Object, timeout: [Number, 3000], message: [String] },
        compareFunc: function (argsObj) {
            var result = {
                pass: undefined,
                message: undefined
            };
            result.pass = argsObj.browsr.wait(protractor.ExpectedConditions.invisibilityOf(argsObj.elem), argsObj.timeout)
                .then(function () { return true; }, function (err) {
                result.message = argsObj.message || "Element " + argsObj.elem.locator() + " was expected NOT to be shown in " + argsObj.timeout + " milliseconds but is visible";
                return false;
            });
            return result;
        },
        negativeCompareFunc: function (argsObj) {
            // Identical to toAppear() matcher
            var result = {
                pass: undefined,
                message: undefined
            };
            result.pass = argsObj.browsr.wait(protractor.ExpectedConditions.visibilityOf(argsObj.elem), argsObj.timeout)
                .then(function () { return true; }, function (err) {
                result.message = argsObj.message || "Element " + argsObj.elem.locator() + " was expected to be shown in " + argsObj.timeout + " milliseconds but is NOT visible";
                return false;
            });
            return result;
        }
    }).build(),
    /**
     * Matcher for asserting that element class attribute has specified class name.
     *
     * Should be applied to ElementFinder object only.
     * Optional Parameters:
     * className - Required, class name to assert in class attribute
     * [timeout=3000] - Timeout to wait for class name to appear in class attribute in milliseconds.
     * [message=''] Custom error message to throw on assertion failure.
     */
    toHaveClass: new Matcher({
        argumentsSignature: { elem: Object, browsr: Object, className: String, timeout: [Number, 3000], message: [String] },
        compareFunc: function (argsObj) {
            var result = {
                pass: undefined,
                message: undefined
            };
            result.pass = argsObj.browsr.wait(function () { return Helpers.hasClass(argsObj.elem, argsObj.className); }, argsObj.timeout)
                .then(function () { return true; }, function (err) {
                result.message = argsObj.message || "Element " + argsObj.elem.locator() + " was expected to have class " + argsObj.className + " in " + argsObj.timeout + ", but it doesnt";
                return false;
            });
            return result;
        },
        negativeCompareFunc: function (argsObj) {
            var result = {
                pass: undefined,
                message: undefined
            };
            result.pass = argsObj.browsr.wait(function () { return Helpers.hasNoClass(argsObj.elem, argsObj.className); }, argsObj.timeout)
                .then(function () { return true; }, function (err) {
                result.message = argsObj.message || "Element " + argsObj.elem.locator() + " was expected NOT to have class " + argsObj.className + " in " + argsObj.timeout + ", but it does";
                return false;
            });
            return result;
        }
    }).build()
};
//# sourceMappingURL=index.js.map