"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let argumentsToObject = require('arguejs'); // Nice! https://github.com/zvictor/ArgueJS
class Matcher {
    constructor(options) {
        this.options = options;
    }
    build() {
        const jasmineFormattedMatcher = {
            compare: (...args) => {
                const argumentsObject = this.prepareArgumentsObject(args);
                return this.options.compareFunc(argumentsObject);
            },
            negativeCompare: (...args) => {
                if (this.options.negativeCompareFunc === undefined) {
                    let funcName = this.options.compareFunc.name;
                    throw Error(`Matcher ${funcName} does not supports negation with .not()`);
                }
                const argumentsObject = this.prepareArgumentsObject(args);
                return this.options.negativeCompareFunc(argumentsObject);
            }
        };
        // Requires to be a function
        return () => jasmineFormattedMatcher;
    }
    prepareArgumentsObject(args) {
        const elem = args[0];
        this.assertElementFinder(elem);
        const browsr = this.extractBrowserFromElementFinder(elem);
        return argumentsToObject(this.options.argumentsSignature, args.splice(1, 0, browsr) // Injecting 'browser' to second position
        );
    }
    assertElementFinder(elem) {
        // TODO: Improve duck-type object verification with more attributes
        let isElementFinder = (elem) => {
            return elem && (elem.browser_ || elem.ptor_) && elem.getAttribute && elem.locator;
        };
        if (!isElementFinder(elem)) {
            throw new Error(`Matcher expects to be applied to ElementFinder object, but got: ${JSON.stringify(elem)} instead`);
        }
    }
    extractBrowserFromElementFinder(elem) {
        return elem.browser_ || elem.ptor_;
    }
}
// Exporting matchers in format that applicable for Jasminejs to import.
exports.default = {
    /**
     * Matcher for asserting that element is present and visible.
     * Should be applied to ElementFinder object only.
     * Optional Parameters:
     * [timeout=3000] - Timeout to wait for appear of element in milliseconds.|
     * [message='Element ELEMENT_LOCATOR was expected to be shown in TIMEOUT milliseconds but is NOT visible'] Custom error message to throw on assertion failure.
     */
    toAppear: new Matcher({
        argumentsSignature: { elem: Object, browsr: Object, className: String, timeout: [Number, 3000], message: [String] },
        compareFunc: (argsObj) => {
            let result = {
                pass: undefined,
                message: undefined
            };
            result.pass = argsObj.browsr.wait(protractor.ExpectedConditions.visibilityOf(argsObj.elem), argsObj.timeout)
                .then(() => true, err => {
                result.message = argsObj.message || `Element ${argsObj.elem.locator()} was expected to be shown in ${argsObj.timeout} milliseconds but is NOT visible`;
                return false;
            });
            return result;
        },
        negativeCompareFunc: (argsObj) => {
            // Identical to toDisappear() matcher
            let result = {
                pass: undefined,
                message: undefined
            };
            result.pass = argsObj.browsr.wait(protractor.ExpectedConditions.invisibilityOf(argsObj.elem), argsObj.timeout)
                .then(() => true, err => {
                result.message = argsObj.message || `Element ${argsObj.elem.locator()} was expected NOT to be shown in ${argsObj.timeout} milliseconds but is visible`;
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
        argumentsSignature: { elem: Object, browsr: Object, className: String, timeout: [Number, 3000], message: [String] },
        compareFunc: (argsObj) => {
            let result = {
                pass: undefined,
                message: undefined
            };
            result.pass = argsObj.browsr.wait(protractor.ExpectedConditions.invisibilityOf(argsObj.elem), argsObj.timeout)
                .then(() => true, err => {
                result.message = argsObj.message || `Element ${argsObj.elem.locator()} was expected NOT to be shown in ${argsObj.timeout} milliseconds but is visible`;
                return false;
            });
            return result;
        },
        negativeCompareFunc: (argsObj) => {
            // Identical to toAppear() matcher
            let result = {
                pass: undefined,
                message: undefined
            };
            result.pass = argsObj.browsr.wait(protractor.ExpectedConditions.visibilityOf(argsObj.elem), argsObj.timeout)
                .then(() => true, err => {
                result.message = argsObj.message || `Element ${argsObj.elem.locator()} was expected to be shown in ${argsObj.timeout} milliseconds but is NOT visible`;
                return false;
            });
            return result;
        }
    }).build()
};
