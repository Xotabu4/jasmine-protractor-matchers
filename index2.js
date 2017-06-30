class Matcher {
    constructor(compareFunc, negativeCompareFunc) {
        this.compareFunc = compareFunc;
        this.negativeCompareFunc = negativeCompareFunc;
    }
    build() {
        return function () {
            return {
                compare: (elementFinder, ...args) => {
                    if (!this.isElementFinder(elementFinder)) {
                        throw new Error(`Matcher expects to be applied to ElementFinder object, but got: ${elementFinder} instead`);
                    }
                },
                negativeCompare: function () {
                    throw Error('.not() negation is not supported for jasmine-protractor-matchers, use opposite matcher instead');
                }
            };
        };
    }
    isElementFinder(elem) {
        return elem && elem.browser_ && elem.getAttribute && elem.locator;
    }
}
