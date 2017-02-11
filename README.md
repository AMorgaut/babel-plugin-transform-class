# babel-plugin-transform-class

> A minimalist ES6 class babel transformer

## Overview

Transpiler are very powerful, but can be frustrating when generated code do not fit to what we'd like.

Use this transform plugin if you like what it generates for you. The generated code is ES3 compliant as long as you also add the required polyfills.

So, this transform plugin purely concentrate itself on the ES6 class notation including support of:

1. the `class` Declarations & Expressions & its constructor, using `function MyClass(args) {/* code */}`
2. its `extends` inheritance, using `MyClass.prototype = Object.create(ParentClass.prototype);`
3. its class methods, using `Object.assign(MyClass.prototype, {/* methods */});`
4. its `statics` methods assigned, using `Object.assign(MyClass, {/* methods */}`
5. the method shortands notation, making `foo() {/* code */}` become `foo: function foo() {/* code */}` (to get function name support)
6. its constructor `super(arg1, arg2)` call, using `ParentClass.call(this, arg1, arg2)` 
7. its method `super.methodName(arg1, arg2)` call, using `ParentClass.prototype.methodName.call(this, arg1, arg2)` 
8. its `new.target` property, currently using `this.constructor`

To get a better idea of the result, you can try it there: https://astexplorer.net/#/gist/0178b41edea28820b2452e3422059cbd/latest

**It does not inject any helper function**

> class properties notation will be potentially added, as well as decorators

## Dependencies

This transform plugin requires the JS target environment to at least support `Object.create()` & `Object.assign()`, either natively or via a polyfill (polyfills are intentionally not included, use the one of your choice).

The `Object.create()` call only use the first parameter (prototype), so their is no need to  

## Limitations / differences with the ES6 standard

1. This transform plugin do not properly subclassed native Objects such as `Date`, `Array`, `DOM` etc 
2. It does not support expressions as parent class, only class/constructor names
3. It does not support getter/setter (they often are bad patterns, source of bugs, leaks, performance failures)
4. It does not throw errors if you invoke the constructor without the new keyword (Linters are good enough to check that)
5. It does not check if you use `this` before calling `super()` (the babel parser already warn against that)
6. It does not support nested classes (classes defined inside a class method)

## Installation

Not yet on npm. Just get it from this repository for now

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
babel --plugins transform-class script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["transform-class"]
});
```
