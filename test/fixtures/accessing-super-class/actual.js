class Test extends Foo {
  constructor() {
    woops.super.test();
    super();
    super.test();
  }

  test() {
    super.test();
  }

  static foo() {
    super.foo();
  }
}
