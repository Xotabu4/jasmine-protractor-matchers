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
                let result = {};
                result.pass = actual.ptor_.wait(protractor.ExpectedConditions.visibilityOf(actual), timeout).then(()=>{
                    result.message = message || "Element "+ actual.parentElementArrayFinder.locator_.toString() +
                        " was expected NOT to be shown in " + timeout + " milliseconds but is visible";
                    return true;
                }, err => {
                    let msg = message || "Element " + actual.parentElementArrayFinder.locator_.toString() +
                        " was expected to be shown in " + timeout + " milliseconds but is NOT visible";
                    throw new Error(msg);
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
                let result = {};
                result.pass = actual.ptor_.wait(protractor.ExpectedConditions.invisibilityOf(actual), timeout).then(()=>{
                    result.message = message || "Element "+ actual.parentElementArrayFinder.locator_.toString() +
                        " was expected to be shown in " + timeout + " milliseconds but is NOT visible";
                    return true;
                }, err => {
                    let msg = message || "Element " + actual.parentElementArrayFinder.locator_.toString() +
                        " was expected NOT to be shown in " + timeout + " milliseconds but is visible";
                    throw new Error(msg);
                });
                return result;
            }
        }
    },
    toEqualWithDelay: function() {
        return {
            compare: function (actual, expected) {
                let message, timeout;
                if (typeof arguments[2] === 'string') {
                    timeout = 3000;
                    message = arguments[2]
                } else {
                    timeout = arguments[2] || 3000;
                    message = arguments[3];
                }
                let result = {};

                let waitForEqual = () => {
                    return Promise.all([actual, expected]).then( (results) => {
                       let comparison = results[0] === results[1];
                       if (comparison) {
                           result.message = message || "Value " + results[0] +
                               " was expected NOT to equal " + results[1] + " within " + timeout + " milliseconds but still is"
                       } else {
                           result.message = message || "Value " + results[0] +
                           " was expected to equal " + results[1] + " within " + timeout + " milliseconds but is NOT";
                       }
                        return comparison;
                    });

                };
                result.pass = browser.wait(waitForEqual, timeout).then( ()=> {
                   // result.message = message || defaultMsg;
                    return true;
                }, err => {
                   // let msg = message || defaultMsg;
                    throw new Error(result.message);
                });
                return result;
            }
        }
    }
};
