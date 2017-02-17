# babel-plugin-transform-class
[![MIT Licensed](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](#license)
[![NPM version](https://badge.fury.io/js/babel-plugin-transform-class.svg)](http://badge.fury.io/js/babel-plugin-transform-class)
[![Build Status](https://secure.travis-ci.org/AMorgaut/babel-plugin-transform-class?branch=master)](https://travis-ci.org/AMorgaut/babel-plugin-transform-class)

> A minimalist ES6 class babel transformer

## Overview

Transpiler are very powerful, but can be frustrating when generated code do not fit to what we'd like.

Use this transform plugin if you like what it generates for you. The generated code is ES3 compliant as long as you also add the required polyfills.

So, this transform plugin purely concentrate itself on the ES6 class notation including support of:

1. the `class` Declarations & Expressions & its constructor, using `function MyClass(args) {/* code */}`
2. its `extends` inheritance, using `MyClass.prototype = Object.create(ParentClass.prototype);`
3. its constructor `super(arg1, arg2)` call, using `ParentClass.call(this, arg1, arg2)` 
4. its `new.target` property, currently using `this.constructor`
5. its class methods, using `Object.assign(MyClass.prototype, {/* methods */});`
6. the method shortands notation, making `foo() {/* code */}` become `foo: function foo() {/* code */}` (to get function name support)
7. its method `super.methodName(arg1, arg2)` call, using `ParentClass.prototype.methodName.call(this, arg1, arg2)` 
8. its `statics` methods assigned, using `Object.assign(MyClass, {/* methods */}`

To get a better idea of the result, you can play with it there: https://astexplorer.net/#/gist/0178b41edea28820b2452e3422059cbd/latest

It use  only one traverse visitor and... **It does not inject any helper function**

## Up to come

Tests are on the way. Looking on a potential way to
ECMAScript stage 2 class properties notation and decorators may be potentially added as they make sense to complete class definition

## Example

**In**

```js
class AbstractClass {
  constructor(a) {}
  publicMethod(foo, bar) {
    console.log('Abstract', new.target);
    this.bar = bar;
  }
}

class MyClass extends AbstractClass {
    static staticMethod(a, b) {
      console.log('static', a, b);
    }
    constructor(a) {
        super(a);
        this.bar = 51;
    }
    publicMethod(foo, bar) {
      super.publicMethod(foo, bar);
      console.log('MyClass', new.target);
    }
}
```

**Out**

```js
function AbstractClass(a) {}

Object.assign(AbstractClass.prototype, {
  publicMethod: function publicMethod(foo, bar) {
    console.log('Abstract', this.constructor);
    this.bar = bar;
  }
});

function MyClass(a) {
    AbstractClass.call(this, a);
    this.bar = 51;
}

MyClass.prototype = Object.create(AbstractClass.prototype);

Object.assign(MyClass.prototype, {
  publicMethod: function publicMethod(foo, bar) {
    AbstractClass.prototype.publicMethod.call(this, foo, bar);
    console.log('MyClass', this.constructor);
  },

  constructor: MyClass
});

Object.assign(MyClass, {
  staticMethod: function staticMethod(a, b) {
    console.log('static', a, b);
  }
});
```

## Dependencies

This transform plugin requires the JS target environment to at least support `Object.create()` & `Object.assign()`, either natively or via a polyfill (polyfills are intentionally not included, use the one of your choice).

The `Object.create(prototype, properties)` call currently only use the first parameter (prototype), so their is no need to include polyfil support of its second argument (the properties object definitions) for now.

## Choosen Limitations from the ES6 standard

1. This transform plugin do not properly subclassed native Objects such as `Date`, `Array`, `DOM` Objects, etc
2. It does not support expressions as parent class, only class/constructor names
3. It does not support getter/setter (they often are bad patterns, source of bugs, leaks, performance failures)
4. It does not throw errors if you invoke the constructor without the new keyword (Linters are good enough to check that)
5. It does not check if you use `this` before calling `super()` (the babel parser already warn against that)
6. It does not support nested classes (classes defined inside a class method)

## Installation

```sh
$ npm install babel-plugin-transform-class
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```js
{
  "plugins": ["transform-class"]
}
```

### Via CLI

```sh
$ babel --plugins transform-class script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["transform-class"]
});
```
