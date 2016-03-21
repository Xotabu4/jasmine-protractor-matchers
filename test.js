/**
 * Created by xotab on 21.03.2016.
 */
"use strict";
var Jasmine = require('jasmine');
var jasmine = new Jasmine();

var matchers = require('./index.js');

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
    }
    isDisplayed() {return true}
}

global.protractor = new protractorMock();

describe('Additional matchers: ', function () {
    describe('toAppear:', function () {

        let toAppear = matchers.toAppear().compare;

        it('should return result object with Promise pass, that resolves to true', function (done) {
            var element = new Element();
            let result = toAppear(element);

            result.pass.then(pass => {
                expect(pass).toBe(true, 'Expected result.pass to be resolved to true');
                done();
            });
        });

        it('should return result object with default message, if not specified', function (done) {
            var element = new Element();
            let result = toAppear(element);

            result.pass.then(() => {
                expect(result.message).toBe("Element " + element.parentElementArrayFinder.locator_ +
                    " was expected NOT to be shown in " + 3000 + " milliseconds but is visible",
                    'Expected message to equal default message');
                done();
            });
        });

        it('should be able to return message object with non-default message and timeout.', function (done) {
            var element = new Element();
            let originalWait = element.ptor_.wait;
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

        it('should be able to return message object, if only message was provided', function (done) {
            var element = new Element();
            let originalWait = element.ptor_.wait;
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

    });

    describe('toDisappear:', function () {
        let toDisappear = matchers.toDisappear().compare;

        it('should return result object with Promise pass, that resolves to true', function (done) {
            var element = new Element();
            let result = toDisappear(element);

            result.pass.then(pass => {
                expect(pass).toBe(true, 'Expected result.pass to be resolved to true');
                done();
            });
        });

        it('should return result object with default message, if not specified', function (done) {
            var element = new Element();
            let result = toDisappear(element);

            result.pass.then(() => {
                expect(result.message).toBe("Element " + element.parentElementArrayFinder.locator_ +
                    " was expected to be shown in " + 3000 + " milliseconds but is NOT visible",
                    'Expected message to equal default message');
                done();
            });
        });

        it('should be able to return message object with non-default message and timeout.', function (done) {
            var element = new Element();
            let originalWait = element.ptor_.wait;
            element.ptor_.wait = function (EC, timeout) {
                element.ptor_.timeout = timeout;
                return originalWait(EC, timeout);
            };
            let result = toDisappear(element, 1000, 'test message');

            result.pass.then(() => {
                expect(result.message).toBe('test message');
                expect(element.ptor_.timeout).toBe(1000);
                done();
            });
        });

        it('should be able to return message object, if only message was provided', function (done) {
            var element = new Element();
            let originalWait = element.ptor_.wait;
            element.ptor_.wait = function (EC, timeout) {
                element.ptor_.timeout = timeout;
                return originalWait(EC, timeout);
            };
            let result = toDisappear(element, 'test message');

            result.pass.then(() => {
                expect(result.message).toBe('test message');
                done();
            });
        });

    });
});

jasmine.execute(['test.js']);

