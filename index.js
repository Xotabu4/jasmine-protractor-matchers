"use strict";

/**
 * Used to acquire internal browser from element.
 * Protractor 4.0 has breaking change in this - .ptor_ was renamed to .browser_
 * In order to provide backward compatibility - trying to detect browser in both places.
 *
 * @returns Protractor instance - browser
 */
function getElementFinderBrowser(elementFinder) {
    if (elementFinder.ptor_ == undefined) {
        if (elementFinder.browser_ == undefined) {
            throw new Error('Matcher expects to be applied to ElementFinder object, ' +
                'please make sure that you pass correct object type');
        } else {
            return elementFinder.browser_;
        }
    } else {
        return elementFinder.ptor_;
    }
}

/**
 * This functions formats compare function, and provides elementFinder and browser instances.
 * Also passes rest of arguments as array, so they can be used (for example - timeout, message ...)
 * 
 * This function can (and should) be used when declaring new matchers.
 * 
 * compareFn will receive: 
 * @param elementFinder - element from expect
 * @param internalBrowser - browser extracted from element
 * @param args - array of all args, passed to matcher, excludes elementfinder, this might be 
 * @returns {{res: boolean, message: string}}
 */
function wrapForJasmine(compareFn) {
    return function () {
        return {
            compare: function () {
                //elementfinder always will be first.
                let elementFinder = arguments[0]; 
                if(!elementFinder) {
                    throw new Error('Matcher expects to be applied to ElementFinder object,' + 
                    'but got:' + elementFinder + 'instead');
                
                }
                
                return compareFn(elementFinder,
                    getElementFinderBrowser(elementFinder),
                    Array.prototype.slice.call(arguments, 1, arguments.length)
                );
            }
            // don't know yet how to better handle .not negation, this is really tricky for 
            // matchers like .toAppear(), .toDissapear(),
            // since they require different functions to be called inside.
            // negativeCompare: function () {
            //     return {pass: false, message: 'none'}
            // }
        }
    }
};

module.exports = {
    toAppear: wrapForJasmine(function (elementFinder, internalBrowser, args) {
        let message, timeout;
        if (typeof args[0] === 'string') {
            timeout = 3000;
            message = args[0]
        } else {
            timeout = args[0] || 3000;
            message = args[1];
        }

        let result = {};
        result.pass = internalBrowser.wait(protractor.ExpectedConditions.visibilityOf(elementFinder), timeout).then(() => {
            return true;
        }, err => {
            result.message = message || "Element " + elementFinder.parentElementArrayFinder.locator_.toString() +
                " was expected to be shown in " + timeout + " milliseconds but is NOT visible";
            return false;
        });
        return result;
    }),

    toDisappear: wrapForJasmine(function (elementFinder, internalBrowser, args) {
        let message, timeout;
        if (typeof args[0] === 'string') {
            timeout = 3000;
            message = args[0]
        } else {
            timeout = args[0] || 3000;
            message = args[1];
        }

        let result = {};
        result.pass = internalBrowser.wait(protractor.ExpectedConditions.invisibilityOf(elementFinder), timeout).then(() => {
            return true;
        }, err => {
            result.message = message || "Element " + elementFinder.parentElementArrayFinder.locator_.toString() +
                " was expected NOT to be shown in " + timeout + " milliseconds but is visible";
            return false;
        });
        return result;
    })
};
