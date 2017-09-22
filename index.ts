let argumentsToObject = require('arguejs') // Nice! https://github.com/zvictor/ArgueJS

// Global peer dependency - protractor
declare var protractor: MockedBrowser

interface CustomMatcherResultPromised {
    pass: Promise<boolean>
    message: string
}

interface IElementFinder {
    ptor_?: IBrowser
    browser_?: IBrowser
    getAttribute: (attr: string) => Promise<String>
    locator(): string
}

interface IBrowser {
    wait: (predicate: Function, timeout: number) => Promise<boolean>
}

class Matcher {
    constructor(private options: {
        // Something like this: {elem: Object, browsr: Object, className: String, timeout: [Number], message: [String]};
        argumentsSignature: any
        compareFunc: (argsObject) => CustomMatcherResultPromised,
        negativeCompareFunc?: (argsObject) => CustomMatcherResultPromised
    }) { }

    build() {
        const jasmineFormattedMatcher = {
            compare: (...args) => {
                const argumentsObject = this.prepareArgumentsObject(args)
                return this.options.compareFunc(argumentsObject)
            },
            negativeCompare: (...args) => {
                if (this.options.negativeCompareFunc === undefined) {
                    let funcName = (this.options.compareFunc as any).name
                    throw Error(`Matcher ${funcName} does not supports negation with .not()`)
                }
                const argumentsObject = this.prepareArgumentsObject(args)
                return this.options.negativeCompareFunc(argumentsObject)
            }
        }
        return jasmineFormattedMatcher
    }

    private prepareArgumentsObject(args) {
        const elem = args[0]
        this.assertElementFinder(elem)
        const browsr = this.extractBrowserFromElementFinder(elem)
        args.splice(1, 0, browsr) // Injecting 'browser' to second position
        return argumentsToObject(
            this.options.argumentsSignature,
            args
        )
    }

    private assertElementFinder(elem: any): void {
        // TODO: Improve duck-type object verification with more attributes
        let isElementFinder = (elem: any): elem is IElementFinder => {
            return elem && (elem.browser_ || elem.ptor_) && elem.getAttribute && elem.locator
        }
        if (!isElementFinder(elem)) {
            throw new Error(`Matcher expects to be applied to ElementFinder object, but got: ${JSON.stringify(elem)} instead`)
        }
    }

    private extractBrowserFromElementFinder(elem: IElementFinder): IBrowser {
        return elem.browser_ || elem.ptor_
    }
}
class Helpers {
    static containsAttributeValue(elem: IElementFinder, attributeName: string, expectedValue: string) {
        let attributeValue = elem.getAttribute(attributeName)
        return attributeValue.then(atrValue => {
            return atrValue.indexOf(expectedValue) !== -1
        }, err => {
            return false
        })
    }

    static containsNoAttributeValue(elem: IElementFinder, attributeName: string, expectedValue: string) {
        return Helpers.containsAttributeValue(elem, attributeName, expectedValue).then(res => !res)
    }

    static hasClass(elem: IElementFinder, classString: string) {
        let classatr = elem.getAttribute('class')
        return classatr.then(classes => {
            // splitting to avoid false positive 'inactiveGrayed inactive'.indexOf('active') !== -1
            let classesArr = classes.split(' ');
            return classesArr.indexOf(classString) !== -1
        }, err => {
            return false
        })
    }
    static hasNoClass(elem: IElementFinder, classString: string) {
        return Helpers.hasClass(elem, classString).then(res => !res)
    }
}

class Matchers {
    /**
     * Matcher for asserting that element is present and visible.
     * Should be applied to ElementFinder object only.
     * Optional Parameters:
     * [timeout=3000] - Timeout to wait for appear of element in milliseconds.|
     * [message='Element ELEMENT_LOCATOR was expected to be shown in TIMEOUT milliseconds but is NOT visible'] Custom error message to throw on assertion failure.
     */
    toAppear() {
        return new Matcher({
            argumentsSignature: { elem: Object, browsr: Object, timeout: [Number, 3000], message: [String] },
            compareFunc: (argsObj) => {
                let result: CustomMatcherResultPromised = {
                    pass: undefined,
                    message: undefined
                }

                result.pass = argsObj.browsr.wait(protractor.ExpectedConditions.visibilityOf(argsObj.elem), argsObj.timeout)
                    .then(() => true,
                    err => {
                        result.message = argsObj.message || `Element ${argsObj.elem.locator()} was expected to be shown in ${argsObj.timeout} milliseconds but is NOT visible`
                        return false
                    })
                return result
            },
            negativeCompareFunc: (argsObj) => {
                // Identical to toDisappear() matcher

                let result: CustomMatcherResultPromised = {
                    pass: undefined,
                    message: undefined
                }

                result.pass = argsObj.browsr.wait(protractor.ExpectedConditions.invisibilityOf(argsObj.elem), argsObj.timeout)
                    .then(() => true,
                    err => {
                        result.message = argsObj.message || `Element ${argsObj.elem.locator()} was expected NOT to be shown in ${argsObj.timeout} milliseconds but is visible`
                        return false
                    })
                return result
            }
        }).build()
    }

    /**
     * Matcher for asserting that element is not displayed on the page.
     * Should be applied to ElementFinder object only.
     * Optional Parameters:
     * [timeout=3000] - Timeout to wait for disappear of element in milliseconds.|
     * [message='Element ELEMENT_LOCATOR was expected NOT to be shown in TIMEOUT milliseconds but is visible'] Custom error message to throw on assertion failure.
     */
    toDisappear() {
        return new Matcher({
            argumentsSignature: { elem: Object, browsr: Object, timeout: [Number, 3000], message: [String] },
            compareFunc: (argsObj) => {
                let result: CustomMatcherResultPromised = {
                    pass: undefined,
                    message: undefined
                }

                result.pass = argsObj.browsr.wait(protractor.ExpectedConditions.invisibilityOf(argsObj.elem), argsObj.timeout)
                    .then(() => true,
                    err => {
                        result.message = argsObj.message || `Element ${argsObj.elem.locator()} was expected NOT to be shown in ${argsObj.timeout} milliseconds but is visible`
                        return false
                    })
                return result
            },
            negativeCompareFunc: (argsObj) => {
                // Identical to toAppear() matcher

                let result: CustomMatcherResultPromised = {
                    pass: undefined,
                    message: undefined
                }

                result.pass = argsObj.browsr.wait(protractor.ExpectedConditions.visibilityOf(argsObj.elem), argsObj.timeout)
                    .then(() => true,
                    err => {
                        result.message = argsObj.message || `Element ${argsObj.elem.locator()} was expected to be shown in ${argsObj.timeout} milliseconds but is NOT visible`
                        return false
                    })
                return result
            }
        }).build()
    }

    /**
     * Matcher for asserting that element class attribute has specified class name.
     *
     * Should be applied to ElementFinder object only.
     * Optional Parameters:
     * className - Required, class name to assert in class attribute
     * [timeout=3000] - Timeout to wait for class name to appear in class attribute in milliseconds.
     * [message='`Element ${argsObj.elem.locator()} was expected to have class "${argsObj.className}" in ${argsObj.timeout} milliseconds, but it doesnt`'] Custom error message to throw on assertion failure.
     */
    toHaveClass() {
        return new Matcher({
            argumentsSignature: { elem: Object, browsr: Object, className: String, timeout: [Number, 3000], message: [String] },
            compareFunc: (argsObj) => {
                let result: CustomMatcherResultPromised = {
                    pass: undefined,
                    message: undefined
                }

                result.pass = argsObj.browsr.wait(() => Helpers.hasClass(argsObj.elem, argsObj.className), argsObj.timeout)
                    .then(() => true,
                    err => {
                        result.message = argsObj.message || `Element ${argsObj.elem.locator()} was expected to have class "${argsObj.className}" in ${argsObj.timeout} milliseconds, but it doesnt`
                        return false
                    })
                return result
            },
            negativeCompareFunc: (argsObj) => {
                let result: CustomMatcherResultPromised = {
                    pass: undefined,
                    message: undefined
                }

                result.pass = argsObj.browsr.wait(() => Helpers.hasNoClass(argsObj.elem, argsObj.className), argsObj.timeout)
                    .then(() => true,
                    err => {
                        result.message = argsObj.message || `Element ${argsObj.elem.locator()} was expected NOT to have class "${argsObj.className}" in ${argsObj.timeout} milliseconds, but it does`
                        return false
                    })
                return result
            }
        }).build()
    }

    /**
     * Matcher for asserting that element attribute includes specified value
     *
     * Should be applied to ElementFinder object only.
     * 
     * attribute - Required, attribute name for element
     * className - Required, attribute value to include
     * [timeout=3000] - Timeout to wait for class name to appear in class attribute in milliseconds.
     * [message='``Element ${argsObj.elem.locator()} was expected atribute "${argsObj.attribute}" to contain "${argsObj.value}" in ${argsObj.timeout} milliseconds, but it doesnt``'] Custom error message to throw on assertion failure.
     */
    toContainAttributeValue() {
        return new Matcher({
            argumentsSignature: { elem: Object, browsr: Object, attribute: String, value: String, timeout: [Number, 3000], message: [String] },
            compareFunc: (argsObj) => {
                let result: CustomMatcherResultPromised = {
                    pass: undefined,
                    message: undefined
                }

                result.pass = argsObj.browsr.wait(() => Helpers.containsAttributeValue(argsObj.elem, argsObj.attribute, argsObj.value), argsObj.timeout)
                    .then(() => true,
                    err => {
                        result.message = argsObj.message || `Element ${argsObj.elem.locator()} was expected atribute "${argsObj.attribute}" to contain "${argsObj.value}" in ${argsObj.timeout} milliseconds, but it doesnt`
                        return false
                    })
                return result
            },
            negativeCompareFunc: (argsObj) => {
                let result: CustomMatcherResultPromised = {
                    pass: undefined,
                    message: undefined
                }

                result.pass = argsObj.browsr.wait(() => Helpers.containsNoAttributeValue(argsObj.elem, argsObj.attribute, argsObj.value), argsObj.timeout)
                    .then(() => true,
                    err => {
                        result.message = argsObj.message || `Element ${argsObj.elem.locator()} was expected atribute "${argsObj.attribute}" NOT to contain "${argsObj.value}" in ${argsObj.timeout} milliseconds, but it doesnt`
                        return false
                    })
                return result
            }
        }).build()
    }
}

//////////////////////// EXPORT ////////////////////////
// Had to switch back to `let matchers = require('jasmine-protractor-matchers')`
// due to default ES6 exports that wrapp everything into 'default' key. 
// TODO: Fix exports to support ES6 import matchers from 'jasmine-protractor-matchers'
module.exports = new Matchers();
