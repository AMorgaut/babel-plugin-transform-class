function Foo() {
  Bar.call(this, () => {
    this.test;
  });
}

Foo.prototype = Object.create(Bar.prototype);
Object.assign(Foo.prototype, {
  constructor: Foo
});
