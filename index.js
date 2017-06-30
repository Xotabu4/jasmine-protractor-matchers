/// <reference types="jasmine" />
/*
 * Created by xotabu4 on 21.03.2016.
 */
/**
 * Used to acquire internal browser from element.
 * Protractor 4.0 has breaking change in this - .ptor_ was renamed to .browser_
 * In order to provide backward compatibility - trying to detect browser.
 *
 * @private
 * @param {{ptor_: Object} | {browser_: Object}}  elementFinder from protractor < 3.x or 4.x
 * @returns {Object} Protractor browser instance
 */
function getElementFinderBrowser(elementFinder) {
    if (elementFinder.browser_ == undefined) {
        throw new Error('Matcher expects to be applied to ElementFinder object, ' +
            'please make sure that you pass correct object type');
    }
    else {
        return elementFinder.browser_;
    }
}
/**
 * Receives compare function, and supplies elementFinder and browser instances to it.
 * Also passes rest of arguments as array, so they can be used (for example - timeout and message)
 *
 * This function can (and should) be used when declaring new matchers.
 *
 * @private
 * @param {function} compareFn comparator function, Will receive as arguments:
 *    elementFinder {ElementFinder} - element to apply matcher
 *
 *    internalBrowser {Protractor} - browser extracted from elementFinder
 *
 *    arguments {Array} - array of rest of arguments passed to matcher, excludes elementFinder
 * @returns {function} that will be used by Jasmine to compare
 */
function wrapForJasmine(compareFn) {
    return function () {
        return {
            compare: function (elementFinder) {
                //elementfinder always will be first, this is jasmine logic for .expect()
                if (elementFinder === undefined) {
                    throw new Error('Matcher expects to be applied to ElementFinder object,' +
                        'but got: ' + elementFinder + ' instead');
                }
                // updating list of arguments to put element and browser to begin, and rest as spreaded arguments
                let formatedArgs = [elementFinder, getElementFinderBrowser(elementFinder)]
                    .concat(Array.prototype.slice.call(arguments, 1, arguments.length));
                // Apply needed to pass array as params, not as single parameter
                return compareFn.apply(undefined, formatedArgs);
            },
            // don't know yet how to better handle .not negation, this is really tricky for 
            // matchers like .toAppear(), .toDissapear(),
            // since they require different functions to be called inside.
            negativeCompare: function () {
                throw Error('.not() negation is not supported for jasmine-protractor-matchers, use opposite matcher instead');
            }
        };
    };
}
let helpers = {
    hasClass: function (elem, classString) {
        return elem.getAttribute('class').then(classes => {
            // splitting to avoid false positive 'inactiveGrayed inactive'.indexOf('active') !== -1
            const classesArr = classes.split(' ');
            return classes.includes(classString);
        }, err => {
            return false;
        });
    }
};
module.exports = {
    //Unfortunately JSDocs are not support override @type of property. So using plain text to show help.
    /**
     * Matcher for asserting that element is present and visible.
     * Should be applied to ElementFinder object only.
     * Optional Parameters:
     * [timeout=3000] - Timeout to wait for appear of element in milliseconds.|
     * [message='Element ELEMENT_LOCATOR was expected to be shown in TIMEOUT milliseconds but is NOT visible'] Custom error message to throw on assertion failure.
     */
    toAppear: wrapForJasmine(function toAppearFunc(elementFinder, internalBrowser, timeout = 3000, message = `Element ${elementFinder.locator().toString()} was expected to be shown in ${timeout} milliseconds but is NOT visible`) {
        let result = {
            pass: undefined,
            message: undefined
        };
        result.pass = internalBrowser.wait(protractor.ExpectedConditions.visibilityOf(elementFinder), timeout)
            .then(() => true, err => {
            result.message = message;
            return false;
        });
        return result;
    }),
    /**
     * Matcher for asserting that element is not displayed on the page.
     * Should be applied to ElementFinder object only.
     * Optional Parameters:
     * [timeout=3000] - Timeout to wait for disappear of element in milliseconds.|
     * [message='Element ELEMENT_LOCATOR was expected NOT to be shown in TIMEOUT milliseconds but is visible'] Custom error message to throw on assertion failure.
     */
    toDisappear: wrapForJasmine(function toDisappearFunc(elementFinder, internalBrowser, timeout = 3000, message = `Element ${elementFinder.locator().toString()} was expected NOT to be shown in ${timeout} milliseconds but is visible`) {
        let result = {
            pass: undefined,
            message: undefined
        };
        result.pass = internalBrowser.wait(protractor.ExpectedConditions.invisibilityOf(elementFinder), timeout)
            .then(() => true, err => {
            result.message = message;
            return false;
        });
        return result;
    }),
};
