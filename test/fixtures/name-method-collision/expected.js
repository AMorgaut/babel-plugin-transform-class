import { a } from "./a";

function Foo() {}

Object.assign(Foo.prototype, {
  _a: function _a() {
    a();
  }
});
