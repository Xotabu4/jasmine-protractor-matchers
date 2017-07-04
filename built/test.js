"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
/*
 * Created by xotabu4 on 21.03.2016
 * gihub.com/xotabu4
 */
var Jasmine = require('jasmine');
var jasmineRunner = new Jasmine();
var index_1 = require("./index");
//////////////////////// MOCKS ////////////////////////
// TODO: Move mocks to separate file
var MockedBrowser = (function () {
    function MockedBrowser() {
        this.ExpectedConditions = {
            visibilityOf: function (elem) { return function () { return elem.isDisplayed(); }; },
            invisibilityOf: function (elem) { return function () { return !elem.isDisplayed(); }; }
        };
    }
    MockedBrowser.prototype.wait = function (condition, timeout) {
        var conditionResult = condition();
        // If condition returns promise - returning new resolved/rejected promise
        if (conditionResult.then) {
            return conditionResult.then(function (res) {
                if (res === true) {
                    return Promise.resolve(res);
                }
                else if (res === false) {
                    return Promise.reject(res);
                }
            });
        }
        if (conditionResult === true) {
            return Promise.resolve(conditionResult);
        }
        else if (conditionResult === false) {
            return Promise.reject(conditionResult);
        }
    };
    return MockedBrowser;
}());
var WebElement = (function () {
    function WebElement() {
        var _this = this;
        this.attributes = {};
        this.parentElementArrayFinder = { locator_: 'test locator' };
        this.locator = function () { return _this.parentElementArrayFinder.locator_; };
    }
    WebElement.prototype.isDisplayed = function () {
        return this.displayed;
    };
    WebElement.prototype.getAttribute = function (atrr) {
        if (this.attributes[atrr]) {
            return Promise.resolve(this.attributes[atrr]);
        }
        else {
            return Promise.resolve(null);
        }
    };
    /** for unit testing only, does not exist in ElementFinder */
    WebElement.prototype.setAttribute = function (name, value) {
        this.attributes[name] = value;
    };
    return WebElement;
}());
var Protractor3WebElement = (function (_super) {
    __extends(Protractor3WebElement, _super);
    function Protractor3WebElement() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.browser_ = undefined;
        _this.ptor_ = new MockedBrowser();
        return _this;
    }
    return Protractor3WebElement;
}(WebElement));
var Protractor4WebElement = (function (_super) {
    __extends(Protractor4WebElement, _super);
    function Protractor4WebElement() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.browser_ = new MockedBrowser();
        _this.ptor_ = undefined;
        return _this;
    }
    return Protractor4WebElement;
}(WebElement));
var VisibleElement = (function (_super) {
    __extends(VisibleElement, _super);
    function VisibleElement() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.displayed = true;
        return _this;
    }
    return VisibleElement;
}(Protractor4WebElement));
var NonVisibleElement = (function (_super) {
    __extends(NonVisibleElement, _super);
    function NonVisibleElement() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.displayed = false;
        return _this;
    }
    return NonVisibleElement;
}(Protractor4WebElement));
// For unittesting, mocking global protractor object
global['protractor'] = new MockedBrowser();
//////////////////////// END MOCKS ////////////////////////
describe('Matcher', function () {
    var toAppear = index_1["default"].toAppear();
    var toDisappear = index_1["default"].toDisappear();
    var toHaveClass = index_1["default"].toHaveClass();
    var matchersFunctions = [
        toAppear.compare, toAppear.negativeCompare,
        toDisappear.compare, toDisappear.negativeCompare,
        toHaveClass.compare, toHaveClass.negativeCompare
    ];
    var nonElementFinders = [
        undefined,
        {},
        { browser_: {}, getAttribute: {} },
        { ptor_: {}, locator: {} } // Something without `getAttribute`
    ];
    nonElementFinders.map(function (nonElementFinder) { return it('Should throw error on attempt to be used non-ElementFinder objects', function () {
        var _loop_1 = function (matcher) {
            var wrapp = function () { return matcher(nonElementFinder); };
            expect(wrapp).toThrowError("Matcher expects to be applied to ElementFinder object, but got: " + JSON.stringify(nonElementFinder) + " instead");
        };
        for (var _i = 0, matchersFunctions_1 = matchersFunctions; _i < matchersFunctions_1.length; _i++) {
            var matcher = matchersFunctions_1[_i];
            _loop_1(matcher);
        }
    }); });
    matchersFunctions.map(function (matcher) {
        it('should support Protractor >4.x .browser_ attribute', function () {
            var wrapped = function () { return matcher(new Protractor4WebElement()); };
            expect(wrapped).not.toThrowError('Matcher is expected to be applied to ElementFinder object, please make sure that you pass correct object type');
        });
        it('should support Protractor <4.x .ptor_ attribute', function () {
            var wrapped = function () { return matcher(new Protractor3WebElement()); };
            expect(wrapped).not.toThrowError('Matcher is expected to be applied to ElementFinder object, please make sure that you pass correct object type');
        });
    });
    describe('toAppear', function () {
        it('should return {pass: Promise<true>} for visible element', function (done) {
            var result = toAppear.compare(new VisibleElement());
            result.pass.then(function (passvalue) {
                expect(passvalue).toBeTruthy('Expected result.pass to be resolved to true');
                expect(result.message).toBe(undefined, 'Expected result.message not to be defined when success');
                done();
            });
        });
        it('should return {pass: Promise<false>, message:string} for non-visible element', function (done) {
            var elem = new NonVisibleElement();
            var result = toAppear.compare(elem);
            result.pass.then(function (passvalue) {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                expect(result.message).toBe("Element " + elem.locator() + " was expected to be shown in 3000 milliseconds but is NOT visible", "Expected message to equal default message");
                done();
            });
        });
        it('should return {pass: Promise<false>, message:string} for non-visible element, when timeout is specified', function (done) {
            var elem = new NonVisibleElement();
            var custom_timeout = 1000;
            spyOn(elem.browser_, 'wait').and.callThrough(); // To detect what timeout was used
            var result = toAppear.compare(elem, custom_timeout);
            result.pass.then(function (passvalue) {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                expect(result.message).toBe("Element " + elem.locator() + " was expected to be shown in " + custom_timeout + " milliseconds but is NOT visible", "Expected message to equal default message");
                // Asserting only one call was done. In actual code this also will be once
                expect(elem.browser_.wait).toHaveBeenCalledTimes(1);
                expect(elem.browser_.wait.calls.argsFor(0)[1]).toBe(custom_timeout, "Wait function should be called with custom timeout - " + custom_timeout);
                done();
            });
        });
        it('should return {pass: Promise<false>, message:string} for non-visible element, when error message is specified', function (done) {
            var elem = new NonVisibleElement();
            var custom_error_message = 'custom error message';
            spyOn(elem.browser_, 'wait').and.callThrough(); // To detect what timeout was used
            var result = toAppear.compare(elem, custom_error_message);
            result.pass.then(function (passvalue) {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                expect(result.message).toBe(custom_error_message, "Expected message to equal custom error message");
                expect(elem.browser_.wait).toHaveBeenCalledTimes(1);
                expect(elem.browser_.wait.calls.argsFor(0)[1]).toBe(3000, "Wait function should be called with default timeout - 3000");
                done();
            });
        });
        it('should return {pass: Promise<false>, message:string} for non-visible element, when timeout and error message is specified', function (done) {
            var elem = new NonVisibleElement();
            var custom_timeout = 1000;
            var custom_error_message = 'custom error message';
            spyOn(elem.browser_, 'wait').and.callThrough(); // To detect what timeout was used
            var result = toAppear.compare(elem, custom_timeout, custom_error_message);
            result.pass.then(function (passvalue) {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                expect(result.message).toBe(custom_error_message, "Expected message to equal custom error message");
                expect(elem.browser_.wait).toHaveBeenCalledTimes(1);
                expect(elem.browser_.wait.calls.argsFor(0)[1]).toBe(custom_timeout, "Wait function should be called with custom timeout - " + custom_timeout);
                done();
            });
        });
        describe('with .not', function () {
            it('should return {pass: Promise<true>} for non-visible element', function (done) {
                var result = toAppear.negativeCompare(new NonVisibleElement());
                result.pass.then(function (passvalue) {
                    expect(passvalue).toBeTruthy('Expected result.pass to be resolved to true');
                    expect(result.message).toBe(undefined, 'Expected result.message not to be defined when success');
                    done();
                });
            });
            it('should return {pass: Promise<false>, message:string} for visible element', function (done) {
                var elem = new VisibleElement();
                var result = toAppear.negativeCompare(elem);
                result.pass.then(function (passvalue) {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                    expect(result.message).toBe("Element " + elem.locator() + " was expected NOT to be shown in 3000 milliseconds but is visible");
                    done();
                });
            });
            it('should return {pass: Promise<false>, message:string} for visible element, when timeout is specified', function (done) {
                var elem = new VisibleElement();
                var custom_timeout = 1000;
                spyOn(elem.browser_, 'wait').and.callThrough(); // To detect what timeout was used
                var result = toAppear.negativeCompare(elem, custom_timeout);
                result.pass.then(function (passvalue) {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                    expect(result.message).toBe("Element " + elem.locator() + " was expected NOT to be shown in " + custom_timeout + " milliseconds but is visible");
                    // Asserting only one call was done. In actual code this also will be once
                    expect(elem.browser_.wait).toHaveBeenCalledTimes(1);
                    expect(elem.browser_.wait.calls.argsFor(0)[1]).toBe(custom_timeout, "Wait function should be called with custom timeout - " + custom_timeout);
                    done();
                });
            });
            it('should return {pass: Promise<false>, message:string} for visible element, when error message is specified', function (done) {
                var elem = new VisibleElement();
                var custom_error_message = 'custom error message';
                spyOn(elem.browser_, 'wait').and.callThrough(); // To detect what timeout was used
                var result = toAppear.negativeCompare(elem, custom_error_message);
                result.pass.then(function (passvalue) {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                    expect(result.message).toBe(custom_error_message, "Expected message to equal custom error message");
                    expect(elem.browser_.wait).toHaveBeenCalledTimes(1);
                    expect(elem.browser_.wait.calls.argsFor(0)[1]).toBe(3000, "Wait function should be called with default timeout - 3000");
                    done();
                });
            });
            it('should return {pass: Promise<false>, message:string} for visible element, when timeout and error message is specified', function (done) {
                var elem = new VisibleElement();
                var custom_timeout = 1000;
                var custom_error_message = 'custom error message';
                spyOn(elem.browser_, 'wait').and.callThrough(); // To detect what timeout was used
                var result = toAppear.negativeCompare(elem, custom_timeout, custom_error_message);
                result.pass.then(function (passvalue) {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                    expect(result.message).toBe(custom_error_message, "Expected message to equal custom error message");
                    expect(elem.browser_.wait).toHaveBeenCalledTimes(1);
                    expect(elem.browser_.wait.calls.argsFor(0)[1]).toBe(custom_timeout, "Wait function should be called with custom timeout - " + custom_timeout);
                    done();
                });
            });
        });
    });
    describe('toDisappear:', function () {
        it('should return {pass: Promise<true>} for non-visible element', function (done) {
            var result = toDisappear.compare(new NonVisibleElement());
            result.pass.then(function (passvalue) {
                expect(passvalue).toBeTruthy('Expected result.pass to be resolved to true');
                expect(result.message).toBe(undefined, 'Expected result.message not to be defined when success');
                done();
            });
        });
        it('should return {pass: Promise<false>, message:string} for visible element', function (done) {
            var elem = new VisibleElement();
            var result = toDisappear.compare(elem);
            result.pass.then(function (passvalue) {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                expect(result.message).toBe("Element " + elem.locator() + " was expected NOT to be shown in 3000 milliseconds but is visible");
                done();
            });
        });
        it('should return {pass: Promise<false>, message:string} for visible element, when timeout is specified', function (done) {
            var elem = new VisibleElement();
            var custom_timeout = 1000;
            spyOn(elem.browser_, 'wait').and.callThrough(); // To detect what timeout was used
            var result = toDisappear.compare(elem, custom_timeout);
            result.pass.then(function (passvalue) {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                expect(result.message).toBe("Element " + elem.locator() + " was expected NOT to be shown in " + custom_timeout + " milliseconds but is visible");
                // Asserting only one call was done. In actual code this also will be once
                expect(elem.browser_.wait).toHaveBeenCalledTimes(1);
                expect(elem.browser_.wait.calls.argsFor(0)[1]).toBe(custom_timeout, "Wait function should be called with custom timeout - " + custom_timeout);
                done();
            });
        });
        it('should return {pass: Promise<false>, message:string} for visible element, when error message is specified', function (done) {
            var elem = new VisibleElement();
            var custom_error_message = 'custom error message';
            spyOn(elem.browser_, 'wait').and.callThrough(); // To detect what timeout was used
            var result = toDisappear.compare(elem, custom_error_message);
            result.pass.then(function (passvalue) {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                expect(result.message).toBe(custom_error_message, "Expected message to equal custom error message");
                expect(elem.browser_.wait).toHaveBeenCalledTimes(1);
                expect(elem.browser_.wait.calls.argsFor(0)[1]).toBe(3000, "Wait function should be called with default timeout - 3000");
                done();
            });
        });
        it('should return {pass: Promise<false>, message:string} for visible element, when timeout and error message is specified', function (done) {
            var elem = new VisibleElement();
            var custom_timeout = 1000;
            var custom_error_message = 'custom error message';
            spyOn(elem.browser_, 'wait').and.callThrough(); // To detect what timeout was used
            var result = toDisappear.compare(elem, custom_timeout, custom_error_message);
            result.pass.then(function (passvalue) {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                expect(result.message).toBe(custom_error_message, "Expected message to equal custom error message");
                expect(elem.browser_.wait).toHaveBeenCalledTimes(1);
                expect(elem.browser_.wait.calls.argsFor(0)[1]).toBe(custom_timeout, "Wait function should be called with custom timeout - " + custom_timeout);
                done();
            });
        });
        describe('with .not', function () {
            it('should return {pass: Promise<true>} for visible element', function (done) {
                var result = toDisappear.negativeCompare(new VisibleElement());
                result.pass.then(function (passvalue) {
                    expect(passvalue).toBeTruthy('Expected result.pass to be resolved to true');
                    expect(result.message).toBe(undefined, 'Expected result.message not to be defined when success');
                    done();
                });
            });
            it('should return {pass: Promise<false>, message:string} for non-visible element', function (done) {
                var elem = new NonVisibleElement();
                var result = toDisappear.negativeCompare(elem);
                result.pass.then(function (passvalue) {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                    expect(result.message).toBe("Element " + elem.locator() + " was expected to be shown in 3000 milliseconds but is NOT visible", "Expected message to equal default message");
                    done();
                });
            });
            it('should return {pass: Promise<false>, message:string} for non-visible element, when timeout is specified', function (done) {
                var elem = new NonVisibleElement();
                var custom_timeout = 1000;
                spyOn(elem.browser_, 'wait').and.callThrough(); // To detect what timeout was used
                var result = toDisappear.negativeCompare(elem, custom_timeout);
                result.pass.then(function (passvalue) {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                    expect(result.message).toBe("Element " + elem.locator() + " was expected to be shown in " + custom_timeout + " milliseconds but is NOT visible", "Expected message to equal default message");
                    // Asserting only one call was done. In actual code this also will be once
                    expect(elem.browser_.wait).toHaveBeenCalledTimes(1);
                    expect(elem.browser_.wait.calls.argsFor(0)[1]).toBe(custom_timeout, "Wait function should be called with custom timeout - " + custom_timeout);
                    done();
                });
            });
            it('should return {pass: Promise<false>, message:string} for non-visible element, when error message is specified', function (done) {
                var elem = new NonVisibleElement();
                var custom_error_message = 'custom error message';
                spyOn(elem.browser_, 'wait').and.callThrough(); // To detect what timeout was used
                var result = toDisappear.negativeCompare(elem, custom_error_message);
                result.pass.then(function (passvalue) {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                    expect(result.message).toBe(custom_error_message, "Expected message to equal custom error message");
                    expect(elem.browser_.wait).toHaveBeenCalledTimes(1);
                    expect(elem.browser_.wait.calls.argsFor(0)[1]).toBe(3000, "Wait function should be called with default timeout - 3000");
                    done();
                });
            });
            it('should return {pass: Promise<false>, message:string} for non-visible element, when timeout and error message is specified', function (done) {
                var elem = new NonVisibleElement();
                var custom_timeout = 1000;
                var custom_error_message = 'custom error message';
                spyOn(elem.browser_, 'wait').and.callThrough(); // To detect what timeout was used
                var result = toDisappear.negativeCompare(elem, custom_timeout, custom_error_message);
                result.pass.then(function (passvalue) {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                    expect(result.message).toBe(custom_error_message, "Expected message to equal custom error message");
                    expect(elem.browser_.wait).toHaveBeenCalledTimes(1);
                    expect(elem.browser_.wait.calls.argsFor(0)[1]).toBe(custom_timeout, "Wait function should be called with custom timeout - " + custom_timeout);
                    done();
                });
            });
        });
    });
    describe('toHaveClass:', function () {
        it('should have required className argument, and throw error if not passed', function () {
            var wrapped = function () { return toHaveClass.compare(new VisibleElement(), undefined); };
            expect(wrapped).toThrowError("parameter 'className' waiting for String argument but received Undefined");
        });
        it('should return {pass: Promise<true>} for element with specified class', function (done) {
            var elem = new VisibleElement();
            elem.setAttribute('class', 'test');
            var result = toHaveClass.compare(elem, 'test');
            result.pass.then(function (passvalue) {
                expect(passvalue).toBeTruthy('Expected result.pass to be resolved to true');
                expect(result.message).toBe(undefined, 'Expected result.message not to be defined when success');
                done();
            });
        });
        it('should return {pass: Promise<false>, message:string} for element without specified class', function (done) {
            var elem = new VisibleElement();
            elem.setAttribute('class', 'nonexist');
            var result = toHaveClass.compare(elem, 'test');
            result.pass.then(function (passvalue) {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                expect(result.message).toBe("Element " + elem.locator() + " was expected to have class \"test\" in 3000 milliseconds, but it doesnt");
                done();
            });
        });
        it('should return {pass: Promise<false>, message:string} for element without specified class, when timeout specified', function (done) {
            var elem = new VisibleElement();
            var custom_timeout = 1000;
            spyOn(elem.browser_, 'wait').and.callThrough(); // To detect what timeout was used
            elem.setAttribute('class', 'nonexist');
            var result = toHaveClass.compare(elem, 'test', custom_timeout);
            result.pass.then(function (passvalue) {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                expect(result.message).toBe("Element " + elem.locator() + " was expected to have class \"test\" in " + custom_timeout + " milliseconds, but it doesnt");
                // Asserting only one call was done. In actual code this also will be once
                expect(elem.browser_.wait).toHaveBeenCalledTimes(1);
                expect(elem.browser_.wait.calls.argsFor(0)[1]).toBe(custom_timeout, "Wait function should be called with custom timeout - " + custom_timeout);
                done();
            });
        });
        it('should return {pass: Promise<false>, message:string} for element without specified class, when error message is specified', function (done) {
            var elem = new VisibleElement();
            elem.setAttribute('class', 'nonexist');
            var result = toHaveClass.compare(elem, 'test', 'test message');
            result.pass.then(function (passvalue) {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                expect(result.message).toBe('test message');
                done();
            });
        });
        it('should return {pass: Promise<false>, message:string} for element without specified class, when timeout and error message is specified', function (done) {
            var elem = new VisibleElement();
            var custom_timeout = 1000;
            spyOn(elem.browser_, 'wait').and.callThrough(); // To detect what timeout was used
            elem.setAttribute('class', 'nonexist');
            var result = toHaveClass.compare(elem, 'test', custom_timeout, 'test message');
            result.pass.then(function (passvalue) {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                expect(result.message).toBe('test message');
                // Asserting only one call was done. In actual code this also will be once
                expect(elem.browser_.wait).toHaveBeenCalledTimes(1);
                expect(elem.browser_.wait.calls.argsFor(0)[1]).toBe(custom_timeout, "Wait function should be called with custom timeout - " + custom_timeout);
                done();
            });
        });
        describe('with .not', function () {
            it('should have required className argument, and throw error if not passed', function () {
                var wrapped = function () { return toHaveClass.negativeCompare(new VisibleElement(), undefined); };
                expect(wrapped).toThrowError("parameter 'className' waiting for String argument but received Undefined");
            });
            it('should return {pass: Promise<true>} for element without specified class', function (done) {
                var elem = new VisibleElement();
                elem.setAttribute('class', 'test');
                var result = toHaveClass.negativeCompare(elem, 'nonexist');
                result.pass.then(function (passvalue) {
                    expect(passvalue).toBeTruthy('Expected result.pass to be resolved to true');
                    expect(result.message).toBe(undefined, 'Expected result.message not to be defined when success');
                    done();
                });
            });
            it('should return {pass: Promise<false>, message:string} for element with specified class', function (done) {
                var elem = new VisibleElement();
                elem.setAttribute('class', 'test');
                var result = toHaveClass.negativeCompare(elem, 'test');
                result.pass.then(function (passvalue) {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                    expect(result.message).toBe("Element " + elem.locator() + " was expected NOT to have class \"test\" in 3000 milliseconds, but it does");
                    done();
                });
            });
            it('should return {pass: Promise<false>, message:string} for element with specified class, when timeout specified', function (done) {
                var elem = new VisibleElement();
                var custom_timeout = 1000;
                spyOn(elem.browser_, 'wait').and.callThrough(); // To detect what timeout was used
                elem.setAttribute('class', 'test');
                var result = toHaveClass.negativeCompare(elem, 'test', custom_timeout);
                result.pass.then(function (passvalue) {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                    expect(result.message).toBe("Element " + elem.locator() + " was expected NOT to have class \"test\" in " + custom_timeout + " milliseconds, but it does");
                    // Asserting only one call was done. In actual code this also will be once
                    expect(elem.browser_.wait).toHaveBeenCalledTimes(1);
                    expect(elem.browser_.wait.calls.argsFor(0)[1]).toBe(custom_timeout, "Wait function should be called with custom timeout - " + custom_timeout);
                    done();
                });
            });
            it('should return {pass: Promise<false>, message:string} for element with specified class, when error message is specified', function (done) {
                var elem = new VisibleElement();
                elem.setAttribute('class', 'test');
                var result = toHaveClass.negativeCompare(elem, 'test', 'test message');
                result.pass.then(function (passvalue) {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                    expect(result.message).toBe('test message');
                    done();
                });
            });
            it('should return {pass: Promise<false>, message:string} for element with specified class, when timeout and error message is specified', function (done) {
                var elem = new VisibleElement();
                var custom_timeout = 1000;
                spyOn(elem.browser_, 'wait').and.callThrough(); // To detect what timeout was used
                elem.setAttribute('class', 'test');
                var result = toHaveClass.negativeCompare(elem, 'test', custom_timeout, 'test message');
                result.pass.then(function (passvalue) {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false');
                    expect(result.message).toBe('test message');
                    // Asserting only one call was done. In actual code this also will be once
                    expect(elem.browser_.wait).toHaveBeenCalledTimes(1);
                    expect(elem.browser_.wait.calls.argsFor(0)[1]).toBe(custom_timeout, "Wait function should be called with custom timeout - " + custom_timeout);
                    done();
                });
            });
        });
    });
});
jasmineRunner.execute(['test.js']);
