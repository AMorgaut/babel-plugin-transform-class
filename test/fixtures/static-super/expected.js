function B() {}

B.prototype = Object.create(A.prototype);
Object.assign(B.prototype, {
  constructor: B
});
Object.assign(B, {
  myMethod: function myMethod(x, y, z) {
    A.myMethod.call(this, x, y, z);
  }
});
