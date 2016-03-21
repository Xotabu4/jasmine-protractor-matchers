"use strict";

//noinspection JSCommentMatchesSignature,JSValidateJSDoc
module.exports = {
    /**
     * Comparator that waits until element would be visible.
     * It is useful for situations when some element dynamic, and appear after little delay.
     *
     * @param actual - element that will be waited to be visible. Should be ElementFinder object.
     * @param timeout - second param. Optional. Time in milliseconds to wait for element appear.
     * @param message - third param. Optional. Message, that will override default error message.
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
     * Oposite matcher to toAppear() . Could be used for element disappearing.
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
    }
};
