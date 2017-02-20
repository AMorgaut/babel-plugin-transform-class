function Test() {
  this.state = "test";
}

function Foo() {
  Bar.call(this);
  this.state = "test";
}

Foo.prototype = Object.create(Bar.prototype);
Object.assign(Foo.prototype, {
  constructor: Foo
});

function ConstructorScoping() {
  let bar;
  {
    let bar;
  }
}
