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

//noinspection JSCommentMatchesSignature,JSValidateJSDoc
module.exports = {
    /**
     * Comparator that waits until element is visible.
     * It is useful for situations when some element is dynamic and appears after some delay.
     *
     * @param actual - element that is expected to be visible. Should be ElementFinder object.
     * @param timeout - second param. Optional. Time in milliseconds to wait for element to appear.
     * @param message - third param. Optional. Message that overrides default error message.
     *
     * @returns {{compare: compare}} comparator function according to Jasmine matchers specification.
     */
    toAppear: function(){
        return {
            compare: function(elementFinder){
                let message, timeout;
                if (typeof arguments[1] === 'string') {
                    timeout = 3000;
                    message = arguments[1]
                } else {
                    timeout = arguments[1] || 3000;
                    message = arguments[2];
                }

                let result = {};
                result.pass = getElementFinderBrowser(elementFinder).wait(protractor.ExpectedConditions.visibilityOf(elementFinder), timeout).then(()=>{
                    result.message = message || "Element "+ elementFinder.parentElementArrayFinder.locator_.toString() +
                        " was expected NOT to be shown in " + timeout + " milliseconds but is visible";
                    return true;
                }, err => {
                    result.message = message || "Element " + elementFinder.parentElementArrayFinder.locator_.toString() +
                        " was expected to be shown in " + timeout + " milliseconds but is NOT visible";
                    return false;
                });
                return result;
            }
        }
    },
    /**
     * Opposite matcher to toAppear() . Can be used for element disappearing checks.
     */
    toDisappear: function(){
        return {
            compare: function(elementFinder){
                let message, timeout;
                if (typeof arguments[1] === 'string') {
                    timeout = 3000;
                    message = arguments[1]
                } else {
                    timeout = arguments[1] || 3000;
                    message = arguments[2];
                }

                let result = {};
                result.pass = getElementFinderBrowser(elementFinder).wait(protractor.ExpectedConditions.invisibilityOf(elementFinder), timeout).then(()=>{
                    result.message = message || "Element "+ elementFinder.parentElementArrayFinder.locator_.toString() +
                        " was expected to be shown in " + timeout + " milliseconds but is NOT visible";
                    return true;
                }, err => {
                    result.message = message || "Element " + elementFinder.parentElementArrayFinder.locator_.toString() +
                        " was expected NOT to be shown in " + timeout + " milliseconds but is visible";
                    return false;
                });
                return result;
            }
        }
    }
};
