JasmineJS matchers for ProtractorJS
===================================
[![Build Status](https://travis-ci.org/Xotabu4/jasmine-protractor-matchers.svg?branch=0.2.0)](https://travis-ci.org/Xotabu4/jasmine-protractor-matchers)[![npm version](https://badge.fury.io/js/jasmine-protractor-matchers.svg)](https://badge.fury.io/js/jasmine-protractor-matchers)[![NPM License](https://img.shields.io/npm/l/jasmine-protractor-matchers.svg)](https://travis-ci.org/Xotabu4/jasmine-protractor-matchers)

This module adds some matchers that can be useful for those who develop test cases with ProtractorJS


Installing
---------------------

```
npm install jasmine-protractor-matchers --save-dev
```

Importing and enabling
---------------------
I prefer to add matchers in beforeAll function, that I put into onPrepare:

In your protractor.config.js:
```javascript
onPrepare: function() {
    var protractorMatchers = require('jasmine-protractor-matchers');
    beforeAll(function() {
        jasmine.addMatchers(protractorMatchers);
        //Some code that needs to be executed before all tests only once.
    });
```

But you can also include only in those specs where it needed, just be sure that you are adding matchers before 'it' function: 

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

* .toAppear(opt_ms_timeout, opt_customMessage) - waits for element to be present and visible
* .toDisappear(opt_ms_timeout, opt_customMessage) - waits for element to be invisible

more will be added each 10 stars :)

Used documentation
------------------
http://jasmine.github.io/edge/custom_matcher.html

https://angular.github.io/protractor/#/api?view=webdriver.WebDriver.prototype.wait

https://angular.github.io/protractor/#/api?view=ExpectedConditions
