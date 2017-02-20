function Test() {}

Test.prototype = Object.create(Foo.prototype);
Object.assign(Test.prototype, {
  constructor: Test
});
