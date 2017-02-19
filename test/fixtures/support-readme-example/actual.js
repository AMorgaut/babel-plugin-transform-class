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
