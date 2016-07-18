"use strict";

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
            compare: function(actual){
                let message, timeout;
                if (typeof arguments[1] === 'string') {
                    timeout = 3000;
                    message = arguments[1]
                } else {
                    timeout = arguments[1] || 3000;
                    message = arguments[2];
                }
                
                if (actual.ptor_ == undefined) {
                    //TODO: #6
                    throw new Error('toAppear() expects to be applied to ElementFinder object, ' +
                        'please make sure that you pass correct object');
                }
                let result = {};
                result.pass = actual.ptor_.wait(protractor.ExpectedConditions.visibilityOf(actual), timeout).then(()=>{
                    result.message = message || "Element "+ actual.parentElementArrayFinder.locator_.toString() +
                        " was expected NOT to be shown in " + timeout + " milliseconds but is visible";
                    return true;
                }, err => {
                    result.message = message || "Element " + actual.parentElementArrayFinder.locator_.toString() +
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
            compare: function(actual){
                let message, timeout;
                if (typeof arguments[1] === 'string') {
                    timeout = 3000;
                    message = arguments[1]
                } else {
                    timeout = arguments[1] || 3000;
                    message = arguments[2];
                }

                if (actual.ptor_ == undefined) {
                    //TODO: #6
                    throw new Error('toDisappear() expects to be applied to ElementFinder object, ' +
                        'please make sure that you pass correct object');
                }

                let result = {};
                result.pass = actual.ptor_.wait(protractor.ExpectedConditions.invisibilityOf(actual), timeout).then(()=>{
                    result.message = message || "Element "+ actual.parentElementArrayFinder.locator_.toString() +
                        " was expected to be shown in " + timeout + " milliseconds but is NOT visible";
                    return true;
                }, err => {
                    result.message = message || "Element " + actual.parentElementArrayFinder.locator_.toString() +
                        " was expected NOT to be shown in " + timeout + " milliseconds but is visible";
                    return false;
                });
                return result;
            }
        }
    }
};
