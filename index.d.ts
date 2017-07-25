/// <reference types="jasmine" />

declare global {
    namespace jasmine {
        interface Matchers<T> {
            /**
             * Matcher for asserting that element is present and visible.
             * Should be applied to ElementFinder object only.
             * 
             * @param {number} timeout Timeout to wait for appear of element in milliseconds. Default is 3000 milliseconds
             * @param {string} custom_error_message Custom error message to throw on assertion failure. Default message is - 'Element ELEMENT_LOCATOR was expected to be shown in TIMEOUT milliseconds but is NOT visible'
             */
            toAppear(timeout?: number, custom_error_message?: string): boolean;

            /**
             * Matcher for asserting that element is present and visible.
             * Should be applied to ElementFinder object only.
             * 
             * @param {string} custom_error_message Custom error message to throw on assertion failure. Default message is - 'Element ELEMENT_LOCATOR was expected to be shown in TIMEOUT milliseconds but is NOT visible'
             */
            toAppear(custom_error_message?: string): boolean;

            /**
             * Matcher for asserting that element is not displayed on the page.
             * Should be applied to ElementFinder object only.
             *
             * @param {number} timeout Timeout to wait for disappear of element in milliseconds. Default is 3000 milliseconds
             * @param {string} custom_error_message Custom error message to throw on assertion failure. Default message is - 'Element ELEMENT_LOCATOR was expected NOT to be shown in TIMEOUT milliseconds but is visible'
             */
            toDisappear(timeout?: number, custom_error_message?: string): boolean;

            /**
             * Matcher for asserting that element is not displayed on the page.
             * Should be applied to ElementFinder object only.
             *
             * @param {string} custom_error_message Custom error message to throw on assertion failure. Default message is - 'Element ELEMENT_LOCATOR was expected NOT to be shown in TIMEOUT milliseconds but is visible'
             */
            toDisappear(custom_error_message?: string): boolean;

            /**
             * Matcher for asserting that element class attribute has specified class name.
             * Should be applied to ElementFinder object only.
             * 
             * @param {string} className class name to assert in class attribute
             * @param {number} timeout Timeout to wait for class name to appear in class attribute in milliseconds.
             * @param {string} custom_error_message Custom error message to throw on assertion failure. Default message is - `Element ${elem.locator()} was expected to have class "${className}" in ${timeout} milliseconds, but it doesnt`
             */
            toHaveClass(className: string, timeout?: number, custom_error_message?: string): boolean;

            /**
             * Matcher for asserting that element class attribute has specified class name.
             * Should be applied to ElementFinder object only.
             * 
             * @param {string} className class name to assert in class attribute
             * @param {number} timeout Timeout to wait for class name to appear in class attribute in milliseconds.
             * @param {string} custom_error_message Custom error message to throw on assertion failure. Default message is - `Element ${elem.locator()} was expected to have class "${className}" in ${timeout} milliseconds, but it doesnt`
             */
            toHaveClass(className: string, custom_error_message?: string): boolean;
        }
    }
}

declare let matchers:jasmine.CustomMatcherFactories
export = matchers;