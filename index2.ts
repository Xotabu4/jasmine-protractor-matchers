let argumentsToObject = require('arguejs') // Nice! https://github.com/zvictor/ArgueJS

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
        negativeCompareFunc: (argsObject) => CustomMatcherResultPromised
    }) { }

    build() {
        const jasmineFormattedMatcher = {
            compare: (...args) => {
                const argumentsObject = this.prepareArgumentsObject(args)
                return this.options.compareFunc(argumentsObject)
            },
            negativeCompare: (...args) => {
                if (this.options.negativeCompareFunc === undefined) {
                    let funcName = this.options.compareFunc.name
                    throw Error(`Matcher ${funcName} does not supports .not(). Try oposite matcher`)
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
        const browsr = this.extractBrowserFromElementFinder(elem)
        return argumentsToObject(
            this.options.argumentsSignature,
            args.splice(1, 0, browsr) // Injecting 'browser' to second position
        )
    }

    private assertElementFinder(elem: any): void {
        let isElementFinder = (elem: any): elem is IElementFinder => {
            return elem && (elem.browser_ || elem.ptor_) && elem.getAttribute && elem.locator
        }
        if (!isElementFinder(elem)) {
            throw new Error(`Matcher expects to be applied to ElementFinder object, but got: ${elem} instead`)
        }
    }

    private extractBrowserFromElementFinder(elem: IElementFinder): IBrowser {
        return elem.browser_ || elem.ptor_
    }
}


let matchersCollection = {
    /**
     * Matcher for asserting that element is present and visible.
     * Should be applied to ElementFinder object only.
     * Optional Parameters:
     * [timeout=3000] - Timeout to wait for appear of element in milliseconds.|
     * [message='Element ELEMENT_LOCATOR was expected to be shown in TIMEOUT milliseconds but is NOT visible'] Custom error message to throw on assertion failure.
     */
    toAppear: new Matcher({
        
    }).build()

    /**
     * Matcher for asserting that element is not displayed on the page.
     * Should be applied to ElementFinder object only.
     * Optional Parameters:
     * [timeout=3000] - Timeout to wait for disappear of element in milliseconds.|
     * [message='Element ELEMENT_LOCATOR was expected NOT to be shown in TIMEOUT milliseconds but is visible'] Custom error message to throw on assertion failure.
     */
    toDisappear: 
}