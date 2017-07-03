/*
 * Created by xotabu4 on 21.03.2016
 * gihub.com/xotabu4
 */
let Jasmine = require('jasmine')
let jasmineRunner = new Jasmine()
import matchers from './index'

//////////////////////// MOCKS ////////////////////////
// TODO: Move mocks to separate file
class MockedBrowser {
    ExpectedConditions = {
        visibilityOf: (elem) => () => elem.isDisplayed(),
        invisibilityOf: (elem) => () => !elem.isDisplayed()
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
    displayed
    attributes = {}

    constructor() {
        this.parentElementArrayFinder = { locator_: 'test locator' }
        this.locator = () => this.parentElementArrayFinder.locator_
    }

    isDisplayed() {
        return this.displayed
    }

    getAttribute(atrr: string) {
        return this.attributes[atrr]
    }

    /** for unit testing only, does not exist in ElementFinder */
    setAttribute(name: string, value: string) {
        this.attributes[name] = value
        return this
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

// For unittesting, mocking global protractor object
global['protractor'] = new MockedBrowser()
declare var protractor: MockedBrowser

//////////////////////// END MOCKS ////////////////////////

describe('Matcher', function () {
    let toAppear = matchers.toAppear()
    let toDisappear = matchers.toDisappear()
    let toHaveClass = matchers.toHaveClass()

    let matchersFunctions = [
        toAppear.compare, toAppear.negativeCompare,
        toDisappear.compare, toDisappear.negativeCompare,
        toHaveClass.compare, toHaveClass.negativeCompare
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

    matchersFunctions.map(matcher => {
        it('should support Protractor >4.x .browser_ attribute', function () {
            let wrapped = () => matcher(new Protractor4WebElement())
            expect(wrapped).not.toThrowError('Matcher is expected to be applied to ElementFinder object, please make sure that you pass correct object type')
        })

        it('should support Protractor <4.x .ptor_ attribute', function () {
            let wrapped = () => matcher(new Protractor3WebElement())
            expect(wrapped).not.toThrowError('Matcher is expected to be applied to ElementFinder object, please make sure that you pass correct object type')
        })
    })

    describe('toAppear', function () {

        it('should return {pass: Promise<true>} for visible element', function (done) {
            let result = toAppear.compare(new VisibleElement())

            result.pass.then(passvalue => {
                expect(passvalue).toBeTruthy('Expected result.pass to be resolved to true')
                expect(result.message).toBe(undefined, 'Expected result.message not to be defined when success')
                done()
            })
        })

        it('should return {pass: Promise<false>, message:string} for non-visible element', function (done) {
            let elem = new NonVisibleElement()
            let result = toAppear.compare(elem)
            result.pass.then((passvalue) => {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                expect(result.message).toBe(`Element ${elem.locator()} was expected to be shown in 3000 milliseconds but is NOT visible`, `Expected message to equal default message`)
                done()
            })
        })

        it('should return {pass: Promise<false>, message:string} for non-visible element, when timeout is specified', function (done) {
            let elem = new NonVisibleElement()
            const custom_timeout = 1000
            spyOn(elem.browser_, 'wait').and.callThrough() // To detect what timeout was used
            let result = toAppear.compare(elem, custom_timeout)

            result.pass.then((passvalue) => {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                expect(result.message).toBe(`Element ${elem.locator()} was expected to be shown in ${custom_timeout} milliseconds but is NOT visible`, `Expected message to equal default message`)
                // Asserting only one call was done. In actual code this also will be once
                expect(elem.browser_.wait).toHaveBeenCalledTimes(1)
                expect((elem.browser_.wait as any).calls.argsFor(0)[1]).toBe(custom_timeout, `Wait function should be called with custom timeout - ${custom_timeout}`)
                done()
            })
        })

        it('should return {pass: Promise<false>, message:string} for non-visible element, when error message is specified', function (done) {
            let elem = new NonVisibleElement()
            const custom_error_message = 'custom error message'

            spyOn(elem.browser_, 'wait').and.callThrough() // To detect what timeout was used
            let result = toAppear.compare(elem, custom_error_message)

            result.pass.then((passvalue) => {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                expect(result.message).toBe(custom_error_message, `Expected message to equal custom error message`)
                expect(elem.browser_.wait).toHaveBeenCalledTimes(1)
                expect((elem.browser_.wait as any).calls.argsFor(0)[1]).toBe(3000, `Wait function should be called with default timeout - 3000`)
                done()
            })
        })

        it('should return {pass: Promise<false>, message:string} for non-visible element, when timeout and error message is specified', function (done) {
            let elem = new NonVisibleElement()
            const custom_timeout = 1000
            const custom_error_message = 'custom error message'

            spyOn(elem.browser_, 'wait').and.callThrough() // To detect what timeout was used
            let result = toAppear.compare(elem, custom_timeout, custom_error_message)

            result.pass.then((passvalue) => {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                expect(result.message).toBe(custom_error_message, `Expected message to equal custom error message`)
                expect(elem.browser_.wait).toHaveBeenCalledTimes(1)
                expect((elem.browser_.wait as any).calls.argsFor(0)[1]).toBe(custom_timeout, `Wait function should be called with custom timeout - ${custom_timeout}`)
                done()
            })
        })

        describe('with .not', function () {
            it('should return {pass: Promise<true>} for non-visible element', function (done) {
                let result = toAppear.negativeCompare(new NonVisibleElement())

                result.pass.then(passvalue => {
                    expect(passvalue).toBeTruthy('Expected result.pass to be resolved to true')
                    expect(result.message).toBe(undefined, 'Expected result.message not to be defined when success')
                    done()
                })
            })

            it('should return {pass: Promise<false>, message:string} for visible element', function (done) {
                let elem = new VisibleElement()
                let result = toAppear.negativeCompare(elem)
                result.pass.then((passvalue) => {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                    expect(result.message).toBe(`Element ${elem.locator()} was expected NOT to be shown in 3000 milliseconds but is visible`)
                    done()
                })
            })

            it('should return {pass: Promise<false>, message:string} for visible element, when timeout is specified', function (done) {
                let elem = new VisibleElement()
                const custom_timeout = 1000
                spyOn(elem.browser_, 'wait').and.callThrough() // To detect what timeout was used
                let result = toAppear.negativeCompare(elem, custom_timeout)

                result.pass.then((passvalue) => {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                    expect(result.message).toBe(`Element ${elem.locator()} was expected NOT to be shown in ${custom_timeout} milliseconds but is visible`)
                    // Asserting only one call was done. In actual code this also will be once
                    expect(elem.browser_.wait).toHaveBeenCalledTimes(1)
                    expect((elem.browser_.wait as any).calls.argsFor(0)[1]).toBe(custom_timeout, `Wait function should be called with custom timeout - ${custom_timeout}`)
                    done()
                })
            })

            it('should return {pass: Promise<false>, message:string} for visible element, when error message is specified', function (done) {
                let elem = new VisibleElement()
                const custom_error_message = 'custom error message'

                spyOn(elem.browser_, 'wait').and.callThrough() // To detect what timeout was used
                let result = toAppear.negativeCompare(elem, custom_error_message)

                result.pass.then((passvalue) => {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                    expect(result.message).toBe(custom_error_message, `Expected message to equal custom error message`)
                    expect(elem.browser_.wait).toHaveBeenCalledTimes(1)
                    expect((elem.browser_.wait as any).calls.argsFor(0)[1]).toBe(3000, `Wait function should be called with default timeout - 3000`)
                    done()
                })
            })

            it('should return {pass: Promise<false>, message:string} for visible element, when timeout and error message is specified', function (done) {
                let elem = new VisibleElement()
                const custom_timeout = 1000
                const custom_error_message = 'custom error message'

                spyOn(elem.browser_, 'wait').and.callThrough() // To detect what timeout was used
                let result = toAppear.negativeCompare(elem, custom_timeout, custom_error_message)

                result.pass.then((passvalue) => {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                    expect(result.message).toBe(custom_error_message, `Expected message to equal custom error message`)
                    expect(elem.browser_.wait).toHaveBeenCalledTimes(1)
                    expect((elem.browser_.wait as any).calls.argsFor(0)[1]).toBe(custom_timeout, `Wait function should be called with custom timeout - ${custom_timeout}`)
                    done()
                })
            })
        })

    })

    describe('toDisappear:', function () {
        it('should return {pass: Promise<true>} for non-visible element', function (done) {
            let result = toDisappear.compare(new NonVisibleElement())

            result.pass.then(passvalue => {
                expect(passvalue).toBeTruthy('Expected result.pass to be resolved to true')
                expect(result.message).toBe(undefined, 'Expected result.message not to be defined when success')
                done()
            })
        })

        it('should return {pass: Promise<false>, message:string} for visible element', function (done) {
            let elem = new VisibleElement()
            let result = toDisappear.compare(elem)
            result.pass.then((passvalue) => {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                expect(result.message).toBe(`Element ${elem.locator()} was expected NOT to be shown in 3000 milliseconds but is visible`)
                done()
            })
        })

        it('should return {pass: Promise<false>, message:string} for visible element, when timeout is specified', function (done) {
            let elem = new VisibleElement()
            const custom_timeout = 1000
            spyOn(elem.browser_, 'wait').and.callThrough() // To detect what timeout was used
            let result = toDisappear.compare(elem, custom_timeout)

            result.pass.then((passvalue) => {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                expect(result.message).toBe(`Element ${elem.locator()} was expected NOT to be shown in ${custom_timeout} milliseconds but is visible`)
                // Asserting only one call was done. In actual code this also will be once
                expect(elem.browser_.wait).toHaveBeenCalledTimes(1)
                expect((elem.browser_.wait as any).calls.argsFor(0)[1]).toBe(custom_timeout, `Wait function should be called with custom timeout - ${custom_timeout}`)
                done()
            })
        })

        it('should return {pass: Promise<false>, message:string} for visible element, when error message is specified', function (done) {
            let elem = new VisibleElement()
            const custom_error_message = 'custom error message'

            spyOn(elem.browser_, 'wait').and.callThrough() // To detect what timeout was used
            let result = toDisappear.compare(elem, custom_error_message)

            result.pass.then((passvalue) => {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                expect(result.message).toBe(custom_error_message, `Expected message to equal custom error message`)
                expect(elem.browser_.wait).toHaveBeenCalledTimes(1)
                expect((elem.browser_.wait as any).calls.argsFor(0)[1]).toBe(3000, `Wait function should be called with default timeout - 3000`)
                done()
            })
        })

        it('should return {pass: Promise<false>, message:string} for visible element, when timeout and error message is specified', function (done) {
            let elem = new VisibleElement()
            const custom_timeout = 1000
            const custom_error_message = 'custom error message'

            spyOn(elem.browser_, 'wait').and.callThrough() // To detect what timeout was used
            let result = toDisappear.compare(elem, custom_timeout, custom_error_message)

            result.pass.then((passvalue) => {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                expect(result.message).toBe(custom_error_message, `Expected message to equal custom error message`)
                expect(elem.browser_.wait).toHaveBeenCalledTimes(1)
                expect((elem.browser_.wait as any).calls.argsFor(0)[1]).toBe(custom_timeout, `Wait function should be called with custom timeout - ${custom_timeout}`)
                done()
            })
        })

        describe('with .not', function () {
            it('should return {pass: Promise<true>} for visible element', function (done) {
                let result = toDisappear.negativeCompare(new VisibleElement())

                result.pass.then(passvalue => {
                    expect(passvalue).toBeTruthy('Expected result.pass to be resolved to true')
                    expect(result.message).toBe(undefined, 'Expected result.message not to be defined when success')
                    done()
                })
            })

            it('should return {pass: Promise<false>, message:string} for non-visible element', function (done) {
                let elem = new NonVisibleElement()
                let result = toDisappear.negativeCompare(elem)
                result.pass.then((passvalue) => {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                    expect(result.message).toBe(`Element ${elem.locator()} was expected to be shown in 3000 milliseconds but is NOT visible`, `Expected message to equal default message`)
                    done()
                })
            })

            it('should return {pass: Promise<false>, message:string} for non-visible element, when timeout is specified', function (done) {
                let elem = new NonVisibleElement()
                const custom_timeout = 1000
                spyOn(elem.browser_, 'wait').and.callThrough() // To detect what timeout was used
                let result = toDisappear.negativeCompare(elem, custom_timeout)

                result.pass.then((passvalue) => {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                    expect(result.message).toBe(`Element ${elem.locator()} was expected to be shown in ${custom_timeout} milliseconds but is NOT visible`, `Expected message to equal default message`)
                    // Asserting only one call was done. In actual code this also will be once
                    expect(elem.browser_.wait).toHaveBeenCalledTimes(1)
                    expect((elem.browser_.wait as any).calls.argsFor(0)[1]).toBe(custom_timeout, `Wait function should be called with custom timeout - ${custom_timeout}`)
                    done()
                })
            })

            it('should return {pass: Promise<false>, message:string} for non-visible element, when error message is specified', function (done) {
                let elem = new NonVisibleElement()
                const custom_error_message = 'custom error message'

                spyOn(elem.browser_, 'wait').and.callThrough() // To detect what timeout was used
                let result = toDisappear.negativeCompare(elem, custom_error_message)

                result.pass.then((passvalue) => {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                    expect(result.message).toBe(custom_error_message, `Expected message to equal custom error message`)
                    expect(elem.browser_.wait).toHaveBeenCalledTimes(1)
                    expect((elem.browser_.wait as any).calls.argsFor(0)[1]).toBe(3000, `Wait function should be called with default timeout - 3000`)
                    done()
                })
            })

            it('should return {pass: Promise<false>, message:string} for non-visible element, when timeout and error message is specified', function (done) {
                let elem = new NonVisibleElement()
                const custom_timeout = 1000
                const custom_error_message = 'custom error message'

                spyOn(elem.browser_, 'wait').and.callThrough() // To detect what timeout was used
                let result = toDisappear.negativeCompare(elem, custom_timeout, custom_error_message)

                result.pass.then((passvalue) => {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                    expect(result.message).toBe(custom_error_message, `Expected message to equal custom error message`)
                    expect(elem.browser_.wait).toHaveBeenCalledTimes(1)
                    expect((elem.browser_.wait as any).calls.argsFor(0)[1]).toBe(custom_timeout, `Wait function should be called with custom timeout - ${custom_timeout}`)
                    done()
                })
            })

        })
    })

    describe('toHaveClass:', function () {
        it('should have required className argument, and throw error if not passed', function () {
            let wrapped = () => toHaveClass.compare(new VisibleElement(), undefined)

            expect(wrapped).toThrowError(`parameter 'className' waiting for String argument but received Undefined`)
        })

        it('should return {pass: Promise<true>} for element with specified class', function (done) {
            let result = toHaveClass.compare(new VisibleElement().setAttribute('class', 'test'), 'test')

            result.pass.then(passvalue => {
                expect(passvalue).toBeTruthy('Expected result.pass to be resolved to true')
                expect(result.message).toBe(undefined, 'Expected result.message not to be defined when success')
                done()
            })
        })

        xit('should return {pass: Promise<false>, message:string} for visible element', function (done) {
            let elem = new VisibleElement()
            let result = toDisappear.compare(elem)
            result.pass.then((passvalue) => {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                expect(result.message).toBe(`Element ${elem.locator()} was expected NOT to be shown in 3000 milliseconds but is visible`)
                done()
            })
        })

        xit('should return {pass: Promise<false>, message:string} for visible element, when timeout is specified', function (done) {
            let elem = new VisibleElement()
            const custom_timeout = 1000
            spyOn(elem.browser_, 'wait').and.callThrough() // To detect what timeout was used
            let result = toDisappear.compare(elem, custom_timeout)

            result.pass.then((passvalue) => {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                expect(result.message).toBe(`Element ${elem.locator()} was expected NOT to be shown in ${custom_timeout} milliseconds but is visible`)
                // Asserting only one call was done. In actual code this also will be once
                expect(elem.browser_.wait).toHaveBeenCalledTimes(1)
                expect((elem.browser_.wait as any).calls.argsFor(0)[1]).toBe(custom_timeout, `Wait function should be called with custom timeout - ${custom_timeout}`)
                done()
            })
        })

        xit('should return {pass: Promise<false>, message:string} for visible element, when error message is specified', function (done) {
            let elem = new VisibleElement()
            const custom_error_message = 'custom error message'

            spyOn(elem.browser_, 'wait').and.callThrough() // To detect what timeout was used
            let result = toDisappear.compare(elem, custom_error_message)

            result.pass.then((passvalue) => {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                expect(result.message).toBe(custom_error_message, `Expected message to equal custom error message`)
                expect(elem.browser_.wait).toHaveBeenCalledTimes(1)
                expect((elem.browser_.wait as any).calls.argsFor(0)[1]).toBe(3000, `Wait function should be called with default timeout - 3000`)
                done()
            })
        })

        xit('should return {pass: Promise<false>, message:string} for visible element, when timeout and error message is specified', function (done) {
            let elem = new VisibleElement()
            const custom_timeout = 1000
            const custom_error_message = 'custom error message'

            spyOn(elem.browser_, 'wait').and.callThrough() // To detect what timeout was used
            let result = toDisappear.compare(elem, custom_timeout, custom_error_message)

            result.pass.then((passvalue) => {
                expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                expect(result.message).toBe(custom_error_message, `Expected message to equal custom error message`)
                expect(elem.browser_.wait).toHaveBeenCalledTimes(1)
                expect((elem.browser_.wait as any).calls.argsFor(0)[1]).toBe(custom_timeout, `Wait function should be called with custom timeout - ${custom_timeout}`)
                done()
            })
        })

        xdescribe('with .not', function () {
            it('should return {pass: Promise<true>} for visible element', function (done) {
                let result = toDisappear.negativeCompare(new VisibleElement())

                result.pass.then(passvalue => {
                    expect(passvalue).toBeTruthy('Expected result.pass to be resolved to true')
                    expect(result.message).toBe(undefined, 'Expected result.message not to be defined when success')
                    done()
                })
            })

            it('should return {pass: Promise<false>, message:string} for non-visible element', function (done) {
                let elem = new VisibleElement()
                let result = toDisappear.negativeCompare(elem)
                result.pass.then((passvalue) => {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                    expect(result.message).toBe(`Element ${elem.locator()} was expected to be shown in 3000 milliseconds but is NOT visible`, `Expected message to equal default message`)
                    done()
                })
            })

            it('should return {pass: Promise<false>, message:string} for non-visible element, when timeout is specified', function (done) {
                let elem = new VisibleElement()
                const custom_timeout = 1000
                spyOn(elem.browser_, 'wait').and.callThrough() // To detect what timeout was used
                let result = toDisappear.negativeCompare(elem, custom_timeout)

                result.pass.then((passvalue) => {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                    expect(result.message).toBe(`Element ${elem.locator()} was expected to be shown in ${custom_timeout} milliseconds but is NOT visible`, `Expected message to equal default message`)
                    // Asserting only one call was done. In actual code this also will be once
                    expect(elem.browser_.wait).toHaveBeenCalledTimes(1)
                    expect((elem.browser_.wait as any).calls.argsFor(0)[1]).toBe(custom_timeout, `Wait function should be called with custom timeout - ${custom_timeout}`)
                    done()
                })
            })

            it('should return {pass: Promise<false>, message:string} for non-visible element, when error message is specified', function (done) {
                let elem = new VisibleElement()
                const custom_error_message = 'custom error message'

                spyOn(elem.browser_, 'wait').and.callThrough() // To detect what timeout was used
                let result = toDisappear.negativeCompare(elem, custom_error_message)

                result.pass.then((passvalue) => {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                    expect(result.message).toBe(custom_error_message, `Expected message to equal custom error message`)
                    expect(elem.browser_.wait).toHaveBeenCalledTimes(1)
                    expect((elem.browser_.wait as any).calls.argsFor(0)[1]).toBe(3000, `Wait function should be called with default timeout - 3000`)
                    done()
                })
            })

            it('should return {pass: Promise<false>, message:string} for non-visible element, when timeout and error message is specified', function (done) {
                let elem = new VisibleElement()
                const custom_timeout = 1000
                const custom_error_message = 'custom error message'

                spyOn(elem.browser_, 'wait').and.callThrough() // To detect what timeout was used
                let result = toDisappear.negativeCompare(elem, custom_timeout, custom_error_message)

                result.pass.then((passvalue) => {
                    expect(passvalue).toBeFalsy('Expected result.pass to be resolved to false')
                    expect(result.message).toBe(custom_error_message, `Expected message to equal custom error message`)
                    expect(elem.browser_.wait).toHaveBeenCalledTimes(1)
                    expect((elem.browser_.wait as any).calls.argsFor(0)[1]).toBe(custom_timeout, `Wait function should be called with custom timeout - ${custom_timeout}`)
                    done()
                })
            })

        })
    })
})

jasmineRunner.execute(['test.js'])

