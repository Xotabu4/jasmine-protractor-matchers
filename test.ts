/*
 * Created by xotabu4 on 21.03.2016
 * gihub.com/xotabu4
 */
let Jasmine = require('jasmine')
let jasmineRunner = new Jasmine()
import matchers from './index'

////////////////// MOCKS //////////////////
// TODO: Move mocks to separate file
class MockedBrowser {
    ExpectedConditions = {
        visibilityOf: (elem) => {
            return elem.isDisplayed()
        },
        invisibilityOf: (elem) => {
            return elem.isDisplayed()
        }
    }

    wait(condition, timeout) {
        let conditionResult = condition()
        if (conditionResult === true) {
            return Promise.resolve(conditionResult)
        } else if (conditionResult === false) {
            return Promise.reject(conditionResult)
        }
    }
}

class WebElement {
    parentElementArrayFinder
    locator
    displayed = true

    constructor() {
        this.parentElementArrayFinder = { locator_: 'test locator' }
        this.locator = () => this.parentElementArrayFinder.locator_
    }
    isDisplayed() {
        return this.displayed
    }
}

class Protractor3WebElement extends WebElement {
    browser_ = undefined
    ptor_ = new MockedBrowser()
}

class Protractor4WebElement extends WebElement {
    browser_ = new MockedBrowser()
    ptor_ = undefined
}

class VisibleElement extends Protractor4WebElement {
    displayed = true
}

class NonVisibleElement extends Protractor4WebElement {
    displayed = false
}

var protractor: any = new MockedBrowser()
////////////////// END MOCKS //////////////////


describe('Matchers: ', function () {
    let toAppear = matchers.toAppear()
    let toDisappear = matchers.toDisappear()

    let matchersFunctions = [
        toAppear.compare, toAppear.negativeCompare,
        toDisappear.compare, toDisappear.negativeCompare
    ]

    let nonElementFinders = [
        undefined,
        {}, //some object type
        { browser_: {}, getAttribute: {} }, // Something without `locator`
        { ptor_: {}, locator: {} } // Something without `getAttribute`
    ]
    nonElementFinders.map((nonElementFinder) => it('Should throw error on attempt to be used non-ElementFinder objects', function () {
        for (let matcher of matchersFunctions) {
            let wrapp = () => matcher(nonElementFinder)
            expect(wrapp).toThrowError(`Matcher expects to be applied to ElementFinder object, but got: ${JSON.stringify(nonElementFinder)} instead`)
        }
    }))

    it('Should support Protractor >4.x .browser_ attribute', function (done) {
        var ptor4Element = new Protractor4WebElement()
        for (let matcher of matchersFunctions) {
            let wrapp = () => matcher(ptor4Element)

            expect(wrapp).not.toThrowError('Matcher is expected to be applied to ElementFinder object, please make sure that you pass correct object type')
            wrapp().pass.then(pass => {
                expect(pass).toBe(true, 'Expected result.pass to be resolved to true')
                done()
            })
        }
    })

    it('Should support Protractor <4.x .ptor_ attribute', function (done) {
        var ptor3Element = new Protractor3WebElement()
        for (let matcher of matchersFunctions) {
            let wrapp = function () {
                return matcher(ptor3Element)
            }
            expect(wrapp).not.toThrowError('Matcher is expected to be applied to ElementFinder object, please make sure that you pass correct object type')
            wrapp().pass.then(pass => {
                expect(pass).toBe(true, 'Expected result.pass to be resolved to true')
                done()
            })
        }
    })

    xdescribe('toAppear:', function () {

        it('compare should return result object with pass:Promise<boolean>', function (done) {
            let element = new VisibleElement()
            let result = toAppear.compare(element)

            result.pass.then(pass => {
                expect(pass).toBe(true, 'Expected result.pass to be resolved to true')
                expect(result.message).toBe(undefined, 'Expected result.message not to be defined when success')
                done()
            })
        })

        it('negativeCompare should return result object with pass:Promise<boolean>', function (done) {
            let element = new NonVisibleElement()
            let result = toAppear.negativeCompare(element)

            result.pass.then(pass => {
                expect(pass).toBe(true, 'Expected result.pass to be resolved to true')
                expect(result.message).toBe(undefined, 'Expected result.message not to be defined when success')
                done()
            })
        })

        it('should return failed result object with default message, if not specified', function (done) {
            let element = new NonVisibleElement()

            let result = toAppear.compare(element)

            result.pass.then(() => {
                expect(result.message).toBe("Element " + element.parentElementArrayFinder.locator_.toString() +
                    " was expected to be shown in " + 3000 + " milliseconds but is NOT visible",
                    'Expected message to equal default message')
                done()
            })
        })

        it('should be able to return message object with non-default message and timeout.', function (done) {
            var element = new WebElement()
            element.displayed = false
            let originalWait = function (EC, timeout) {
                return new Promise((resolve, reject) => reject())
            }
            element.browser_.wait = function (EC, timeout) {
                element.browser_.timeout = timeout

                return originalWait(EC, timeout)
            }
            let result = toAppear.compare(element, 1000, 'test message')

            result.pass.then(() => {
                expect(result.message).toBe('test message')
                expect(element.browser_.timeout).toBe(1000)
                done()
            })
        })

        it('should be able to return failed object with message, if only message was provided', function (done) {
            var element = new WebElement()
            let originalWait = function (EC, timeout) {
                return new Promise((resolve, reject) => reject())
            }
            element.browser_.wait = function (EC, timeout) {
                element.browser_.timeout = timeout
                return originalWait(EC, timeout)
            }
            let result = toAppear.compare(element, 'test message')

            result.pass.then(() => {
                expect(result.message).toBe('test message')
                done()
            })
        })

        it('should reject result.pass if wait has failed', function (done) {
            var element = new WebElement()
            element.displayed = false
            element.browser_.wait = function (EC) {
                return new Promise((resolve, reject) => reject())
            }

            let res = toAppear.compare(element)
            res.pass.then(result => {
                expect(result).toBe(false)
                expect(res.message).toBe('Element test locator was expected to be shown in 3000 milliseconds but is NOT visible')
                done()
            })
        })

    })

    xdescribe('toDisappear:', function () {

        it('should return result object with Promise pass, that resolves to true', function (done) {
            var element = new Element()
            let result = toDisappear.compare(element)

            result.pass.then(pass => {
                expect(result.message).toBe(undefined, 'Expected result.message not to be defined when success')
                expect(pass).toBe(true, 'Expected result.pass to be resolved to true')
                done()
            })
        })

        it('should return failed result object with default message, if not specified', function (done) {
            var element = new WebElement()
            element.displayed = false
            element.browser_.wait = function (EC) {
                return new Promise((resolve, reject) => reject())
            }
            let result = toDisappear.compare(element)

            result.pass.then((pass) => {
                expect(pass).toBe(false, 'Expected result.pass to be resolved to false')
                expect(result.message).toBe("Element " + element.parentElementArrayFinder.locator_.toString() +
                    " was expected NOT to be shown in " + 3000 + " milliseconds but is visible",
                    'Expected message to equal default message')
                done()
            })
        })

        it('should be able to return message object with non-default message and timeout.', function (done) {
            var element = new WebElement()
            let originalWait = function (EC, timeout) {
                return new Promise((resolve, reject) => reject())
            }
            element.browser_.wait = function (EC, timeout) {
                element.browser_.timeout = timeout
                return originalWait(EC, timeout)
            }
            let result = toDisappear.compare(element, 1000, 'test message')

            result.pass.then((pass) => {
                expect(pass).toBe(false, 'Expected result.pass to be resolved to false')
                expect(result.message).toBe('test message')
                expect(element.browser_.timeout).toBe(1000)
                done()
            })
        })

        it('should be able to return message object, if only message was provided', function (done) {
            var element = new WebElement()
            let originalWait = function (EC, timeout) {
                return new Promise((resolve, reject) => reject())
            }
            element.browser_.wait = function (EC, timeout) {
                element.browser_.timeout = timeout
                return originalWait(EC, timeout)
            }
            let result = toDisappear.compare(element, 'test message')

            result.pass.then((pass) => {
                expect(pass).toBe(false, 'Expected result.pass to be resolved to false')
                expect(result.message).toBe('test message')
                done()
            })
        })

        it('should reject result.pass if wait has failed', function (done) {
            var element = new WebElement()
            element.displayed = false
            element.browser_.wait = function (EC) {
                return new Promise((resolve, reject) => reject())
            }

            let res = toDisappear.compare(element)
            res.pass.then(result => {
                expect(result).toBe(false)
                expect(res.message).toBe('Element test locator was expected NOT to be shown in 3000 milliseconds but is visible')
                done()
            })
        })

    })

})

jasmineRunner.execute(['test.js'])

