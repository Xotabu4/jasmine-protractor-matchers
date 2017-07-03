let argumentsToObject = require('arguejs') // Nice! https://github.com/zvictor/ArgueJS

// Global peer dependency - protractor
declare var protractor: any

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
        // Requires to be a function
        return () => jasmineFormattedMatcher
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
    static hasClass(elem: IElementFinder, classString: string) {
        return elem.getAttribute('class').then(classes => {
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

//////////////////////// EXPORT ////////////////////////

// Exporting matchers in format that applicable for Jasminejs to import.
export default {
    /**
     * Matcher for asserting that element is present and visible.
     * Should be applied to ElementFinder object only.
     * Optional Parameters:
     * [timeout=3000] - Timeout to wait for appear of element in milliseconds.|
     * [message='Element ELEMENT_LOCATOR was expected to be shown in TIMEOUT milliseconds but is NOT visible'] Custom error message to throw on assertion failure.
     */
    toAppear: new Matcher({
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
    }).build(),

    /**
     * Matcher for asserting that element is not displayed on the page.
     * Should be applied to ElementFinder object only.
     * Optional Parameters:
     * [timeout=3000] - Timeout to wait for disappear of element in milliseconds.|
     * [message='Element ELEMENT_LOCATOR was expected NOT to be shown in TIMEOUT milliseconds but is visible'] Custom error message to throw on assertion failure.
     */
    toDisappear: new Matcher({
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
    }).build(),

    /**
     * Matcher for asserting that element class attribute has specified class name.
     *
     * Should be applied to ElementFinder object only.
     * Optional Parameters:
     * className - Required, class name to assert in class attribute
     * [timeout=3000] - Timeout to wait for class name to appear in class attribute in milliseconds.
     * [message=''] Custom error message to throw on assertion failure.
     */
    toHaveClass: new Matcher({
        argumentsSignature: { elem: Object, browsr: Object, className: String, timeout: [Number, 3000], message: [String] },
        compareFunc: (argsObj) => {
            let result: CustomMatcherResultPromised = {
                pass: undefined,
                message: undefined
            }

            result.pass = argsObj.browsr.wait(() => Helpers.hasClass(argsObj.elem, argsObj.className), argsObj.timeout)
                .then(() => true,
                err => {
                    result.message = argsObj.message || `Element ${argsObj.elem.locator()} was expected to have class ${argsObj.className} in ${argsObj.timeout}, but it doesnt`
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
                    result.message = argsObj.message || `Element ${argsObj.elem.locator()} was expected NOT to have class ${argsObj.className} in ${argsObj.timeout}, but it does`
                    return false
                })
            return result
        }
    }).build()
}
