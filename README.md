JasmineJS matchers for ProtractorJS
===================================
[![Build Status](https://travis-ci.org/Xotabu4/jasmine-protractor-matchers.svg?branch=master)](https://travis-ci.org/Xotabu4/jasmine-protractor-matchers)[![npm version](https://badge.fury.io/js/jasmine-protractor-matchers.svg)](https://badge.fury.io/js/jasmine-protractor-matchers)


This module adds some matchers that can be useful for those who develop test cases with ProtractorJS and Jasmine

Supported versions
---------------------
Currently tested on 
NodeJS:
- 4.x
- 5.x
- 6.x
- 7.x
- 8.x

ProtractorJS:
- 3.x
- 4.x
- 5.x

Typings for TypeScript are included

Installing
---------------------

```
npm install jasmine-protractor-matchers --save-dev
```

Importing and enabling
---------------------
I prefer to add matchers in beforeEach function, that I put into onPrepare:

In your protractor.config.js:
```javascript
onPrepare: function() {
    var protractorMatchers = require('jasmine-protractor-matchers');
    beforeEach(function() {
        jasmine.addMatchers(protractorMatchers);
        //Some code that needs to be executed before every test.
    });
```

But you can also include matchers only in those specs where it is needed, just ensure that you are adding matchers before 'it' function: 

some_jasmine_spec.js
```javascript
var protractorMatchers = require('jasmine-protractor-matchers');
describe('Some test suite', function () {
    beforeEach(function() {
        jasmine.addMatchers(protractorMatchers);
    })
    it('some testcase', function () {
        //test code here
    });
});
```

#### TypeScript

To import matchers - use approach with `require` as in JS:
```typescript
onPrepare: function() {
    var protractorMatchers = require('jasmine-protractor-matchers');
    beforeAll(function() {
        jasmine.addMatchers(protractorMatchers);
        //Some code that needs to be executed before all tests only once.
    });
```

But in jasmine spec files where you want to use this matchers, you must add this line to the top of the file:
```xml
/// <reference types="jasmine-protractor-matchers" />
```

This needs to be done to let TypeScript know that we have extended jasmine module with additional matchers. Now you should see aditional suggestions in autocomplete, and typings support.


Usage
-----
Usage is pretty simple, since no any rocket science under hood. After matchers are added to jasmine, you have new functions to use:

```javascript
it('test 1', function () {
    browser.get('http://www.myangularapplication.com');
    //Pass ElementFinder object (single element returned by protractor after search) into expect function
    expect($('html')).toAppear(); //Matcher will wait for element for 3 seconds if no parameters provided.
});

it('test 2', function () {
    browser.get('http://www.myangularapplication.com');
    expect($('div.slowelement')).toAppear(10000); //Waiting for 10 seconds untill failing test.
});

it('test 2', function () {
    browser.get('http://www.myangularapplication.com');
    expect(browser.element(by.id('login')).toAppear(1000, 'Login button should be visible after page open'); 
    //You can provide custom exception message, instead default message.
});
```

List of matchers
----------------

#### toAppear
`toAppear(timeout?: number, custom_error_message?: string): boolean;`

Matcher for asserting that element is present and visible.
Should be applied to ElementFinder object only.
         
`@param {number} timeout` Timeout to wait for appear of element in milliseconds. Default is 3000 milliseconds

`@param {string} custom_error_message` Custom error message to throw on assertion failure. Default message is - `Element ELEMENT_LOCATOR was expected to be shown in TIMEOUT milliseconds but is NOT visible`
         
##### Example
```javascript
expect($('body')).toAppear()
expect($('body')).toAppear(5000) // Will wait for 5 seconds for element to be visible
expect($('body')).toAppear('body element should appear!') // Will wait for 3 seconds for element to be displayed, and throw your custom error message if not
```

------------------
#### toDisappear
`toDisappear(timeout?: number, custom_error_message?: string): boolean;`

Matcher for asserting that element is not visible on the page.
Should be applied to ElementFinder object only.
         
`@param {number} timeout` Timeout to wait for to disappear of element in milliseconds. Default is 3000 milliseconds

`@param {string} custom_error_message` Custom error message to throw on assertion failure. Default message is - `Element ELEMENT_LOCATOR was expected NOT to be shown in TIMEOUT milliseconds but is visible`
         
##### Example
```javascript
expect($('.popup')).toDisappear()
expect($('.popup')).toDisappear(5000) // Will wait for 5 seconds for element to be visible
expect($('.popup')).toDisappear('body element should appear!') // Will wait for 3 seconds for element to be displayed, and throw your custom error message if not
```


------------------
#### toHaveClass
`toDisappear(timeout?: number, custom_error_message?: string): boolean;`

Matcher for asserting that element class attribute has specified class name. For example - we have element `<div class='hello worlds'></div>`
Should be applied to ElementFinder object only.
         
`@param {number} timeout` Timeout to wait for to disappear of element in milliseconds. Default is 3000 milliseconds

`@param {string} custom_error_message` Custom error message to throw on assertion failure. Default message is - `Element ELEMENT_LOCATOR was expected NOT to be shown in TIMEOUT milliseconds but is visible`
         
##### Example
```javascript
expect($('.popup')).toHaveClass()
expect($('.popup')).toHaveClass(5000) // Will wait for 5 seconds for element to be visible
expect($('.popup')).toHaveClass('body element should appear!') // Will wait for 3 seconds for element to be displayed, and throw your custom error message if not
```

Used documentation
------------------
http://jasmine.github.io/edge/custom_matcher.html

https://angular.github.io/protractor/#/api?view=webdriver.WebDriver.prototype.wait

https://angular.github.io/protractor/#/api?view=ExpectedConditions

https://github.com/zvictor/ArgueJS