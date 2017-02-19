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
