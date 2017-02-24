function Test() {
  woops.super.test();
  Foo.call(this);
  Foo.prototype.test.call(this);
}

Test.prototype = Object.create(Foo.prototype);
Object.assign(Test.prototype, {
  test: function test() {
    Foo.prototype.test.call(this);
  },
  constructor: Test
});
Object.assign(Test, {
  foo: function foo() {
    Foo.foo.call(this);
  }
});
