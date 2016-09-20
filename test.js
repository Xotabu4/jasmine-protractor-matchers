/*
 * Created by xotabu4 on 21.03.2016.
 */
"use strict";
var Jasmine = require('jasmine');
var jasmine = new Jasmine();

var matchers = require('./index.js');


// Mock objects
class ExpectedConditions {
    visibilityOf(elem) {
        return elem.isDisplayed();
    };
    invisibilityOf(elem) {
        return elem.isDisplayed();
    }
}

class protractorMock {
    constructor() {
        this.ExpectedConditions = new ExpectedConditions();
    }

    wait(EC, timeout) {
        return Promise.resolve(EC);
    }
}

class Element {
    constructor() {
        this.parentElementArrayFinder = {locator_: 'test locator'};
        this.ptor_ =  new protractorMock();
        this.displayed = true;
    }
    isDisplayed() {return this.displayed}
}

global.protractor = new protractorMock();

// End of mocks

describe('Additional matchers: ', function () {
    let toAppear = matchers.toAppear().compare;
    let toDisappear = matchers.toDisappear().compare;

    let matchersFunctions = [toAppear, toDisappear];

   it('Should throw error on attempt to call negateCompare', function () {
        let negativeCompares = [
            matchers.toAppear().negativeCompare,
            matchers.toDisappear().negativeCompare,
        ]

        for (let negMatcher of negativeCompares) {
            expect(negMatcher).toThrowError('.not() negation is not supported for jasmine-protractor-matchers, use opposite matcher instead');
        }
    });

    it('Should throw error on attempt to be used on object without browser reference', function () {
        var nonElement = {};
        for (let matcher of matchersFunctions) {
            let wrapp = function () {
                return matcher(nonElement);
            };
            expect(wrapp).toThrowError('Matcher expects to be applied to ElementFinder object, please make sure that you pass correct object type')
        }
    });

    it('Should throw error on attempt to be used on undefined object', function () {
        var nonElement = undefined;
        for (let matcher of matchersFunctions) {
            let wrapp = function () {
                return matcher(nonElement);
            };
            expect(wrapp).toThrowError('Matcher expects to be applied to ElementFinder object,' + 
                    'but got:' + nonElement + 'instead');
        }
    });

    it('Should support both: Protractor 3.x .ptor_ and Protractor 4.x .browser_ attributes', function (done) {
        var ptor4Element = new Element();
        ptor4Element.ptor_ = undefined;
        ptor4Element.browser_ = new protractorMock();
        for (let matcher of matchersFunctions) {
            let wrapp = function () {
                return matcher(ptor4Element);
            };
            expect(wrapp).not.toThrowError('Matcher is expected to be applied to ElementFinder object, please make sure that you pass correct object type');
            wrapp().pass.then(pass => {
                expect(pass).toBe(true, 'Expected result.pass to be resolved to true');

            });
        }

        var ptor3Element = new Element();
        for (let matcher of matchersFunctions) {
            let wrapp = function () {
                return matcher(ptor3Element);
            };
            expect(wrapp).not.toThrowError('Matcher is expected to be applied to ElementFinder object, please make sure that you pass correct object type');
            wrapp().pass.then(pass => {
                expect(pass).toBe(true, 'Expected result.pass to be resolved to true');
                done();
            });
        }
    });

    describe('toAppear:', function () {

        it('should return result object with Promise pass, that resolves to true', function (done) {
            var element = new Element();
            let result = toAppear(element);

            result.pass.then(pass => {
                expect(pass).toBe(true, 'Expected result.pass to be resolved to true');
                expect(result.message).toBe(undefined, 'Expected result.message not to be defined when success');
                done();
            });
        });

        it('should return failed result object with default message, if not specified', function (done) {
            var element = new Element();
            element.displayed = false;
            element.ptor_.wait = function(EC) {
                return Promise.reject();
            };
            let result = toAppear(element);

            result.pass.then(() => {
                expect(result.message).toBe("Element " + element.parentElementArrayFinder.locator_.toString() +
                " was expected to be shown in " + 3000 + " milliseconds but is NOT visible",
                    'Expected message to equal default message');
                done();
            });
        });

        it('should be able to return message object with non-default message and timeout.', function (done) {
            var element = new Element();
            element.displayed = false;
            let originalWait = function(EC) {
                return Promise.reject();
            };
            element.ptor_.wait = function (EC, timeout) {
                element.ptor_.timeout = timeout;
                
                return originalWait(EC, timeout);
            };
            let result = toAppear(element, 1000, 'test message');

            result.pass.then(() => {
                expect(result.message).toBe('test message');
                expect(element.ptor_.timeout).toBe(1000);
                done();
            });
        });

        it('should be able to return failed object with message, if only message was provided', function (done) {
            var element = new Element();
            let originalWait = function(EC) {
                return Promise.reject();
            };
            element.ptor_.wait = function (EC, timeout) {
                element.ptor_.timeout = timeout;
                return originalWait(EC, timeout);
            };
            let result = toAppear(element, 'test message');

            result.pass.then(() => {
                expect(result.message).toBe('test message');
                done();
            });
        });

        it('should reject result.pass if wait has failed', function (done) {
            var element = new Element();
            element.displayed = false;
            element.ptor_.wait = function(EC) {
                return Promise.reject();
            };

            let res = toAppear(element);
            res.pass.then(result=> {
                expect(result).toBe(false);
                expect(res.message).toBe('Element test locator was expected to be shown in 3000 milliseconds but is NOT visible');
                done();
            });
        });

    });

    describe('toDisappear:', function () {

        it('should return result object with Promise pass, that resolves to true', function (done) {
            var element = new Element();
            let result = toDisappear(element);

            result.pass.then(pass => {
                expect(result.message).toBe(undefined, 'Expected result.message not to be defined when success');
                expect(pass).toBe(true, 'Expected result.pass to be resolved to true');
                done();
            });
        });

        it('should return failed result object with default message, if not specified', function (done) {
            var element = new Element();
            element.displayed = false;
            element.ptor_.wait = function(EC) {
                return Promise.reject();
            };
            let result = toDisappear(element);

            result.pass.then((pass) => {
                expect(pass).toBe(false, 'Expected result.pass to be resolved to false');
                expect(result.message).toBe("Element " + element.parentElementArrayFinder.locator_.toString() +
                " was expected NOT to be shown in " + 3000 + " milliseconds but is visible",
                    'Expected message to equal default message');
                done();
            });
        });

        it('should be able to return message object with non-default message and timeout.', function (done) {
            var element = new Element();
            let originalWait = function(EC) {
                return Promise.reject();
            };
            element.ptor_.wait = function (EC, timeout) {
                element.ptor_.timeout = timeout;
                return originalWait(EC, timeout);
            };
            let result = toDisappear(element, 1000, 'test message');

            result.pass.then((pass) => {
                expect(pass).toBe(false, 'Expected result.pass to be resolved to false');
                expect(result.message).toBe('test message');
                expect(element.ptor_.timeout).toBe(1000);
                done();
            });
        });

        it('should be able to return message object, if only message was provided', function (done) {
            var element = new Element();
            let originalWait = function(EC) {
                return Promise.reject();
            };
            element.ptor_.wait = function (EC, timeout) {
                element.ptor_.timeout = timeout;
                return originalWait(EC, timeout);
            };
            let result = toDisappear(element, 'test message');

            result.pass.then((pass) => {
                expect(pass).toBe(false, 'Expected result.pass to be resolved to false');
                expect(result.message).toBe('test message');
                done();
            });
        });

        it('should reject result.pass if wait has failed', function (done) {
            var element = new Element();
            element.displayed = false;
            element.ptor_.wait = function(EC) {
                return Promise.reject();
            };

            let res = toDisappear(element);
            res.pass.then(result=> {
                expect(result).toBe(false);
                expect(res.message).toBe('Element test locator was expected NOT to be shown in 3000 milliseconds but is visible');
                done();
            });
        });

    });
    
});

jasmine.execute(['test.js']);

