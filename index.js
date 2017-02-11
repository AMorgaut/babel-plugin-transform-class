export default function (babel) {

  const t = babel.types;
  var visitor, _class;
  
  visitor = {
    // CLASS
    ClassDeclaration: {
      enter(path) {
        _class = {id: path.node.id, parentId: path.node.superClass, statics: [], methods: []};
      },
      exit(path) {
        path.replaceWithMultiple(es5Class(_class));
      }
    },
    // SUPER CALL
    Super: superCall,
    // NEW.TARGET
    MetaProperty(path) {
      var node = path.node;
      if (node.meta.name === "new" && node.property.name === "target") {
        path.replaceWith(expression('this.constructor'));
      }
    },
    // METHODS
    ClassMethod(path) {
      var node = path.node;
      if (node.kind === 'constructor') { 
        // CONSTRUCTOR
        _class.constructor = t.functionDeclaration(_class.id,  node.params, node.body); 
        return;
      }
      if (node.static) { 
        // STATIC METHODS
        _class.statics.push(es5Method(node)); 
        return;
      }
      // PROTOTYPE METHODS
      _class.methods.push(es5Method(node));
    }
  };
  
  // Utils
  
  function isString(value) {
      return typeof value === 'string';
  }
  function isMember(value) {
      return value.type = 'MemberExpression';
  }
  
  function toIdentifier(key) {
    return t.identifier(key)
  }
  
  function toMember(target, property) {
    return t.memberExpression(target, property);
  }
  
  function expression() {
    var index = arguments.length - 1, members = [], member;
    do {
      member = arguments[index];
      members = isString(member) ?
        members.concat(member.split('.').reverse().map(toIdentifier)) :
        members.concat([member]);
      index--;
    } while (index > -1);
    return members.reduceRight(toMember);
  }
  
  function objectAssign(target, members) {
    return t.expressionStatement(t.callExpression(
      // Object.assign(target, members)
      expression("Object.assign"), [target, t.objectExpression(members)]
    ));
  }
  
  function objectCreate(parentClass) {
    return t.callExpression(
      // Object.create(parentClass)
      expression("Object.create"), [parentClass]
    );
  }
  
  function assign(key, value) {
    // key = value
    return t.expressionStatement(t.assignmentExpression('=', key, value));
  }
  
  function es5Method(method) {
    var id = method.key;
    // foo: function foo(args) {/* code */}
    return t.objectProperty(id, t.functionExpression(id, method.params, method.body));
  }
  
  function superCall(path) {
    var 
        targetPath = path.parentPath,
        ParentClass = _class.parentId,
        caller, method;
    if (path.parent.type ==="MemberExpression") {
      method = targetPath.node.property;
      targetPath = targetPath.parentPath;
      // caller => ParentClass.prototype.methodName.call
      caller = expression(ParentClass, 'prototype', method, 'call');
    } else {
      // caller => ParentClass.call
      caller = expression(ParentClass, 'call');
    }
    targetPath.replaceWith(t.callExpression(
      // {super target}.apply(this, args)
      caller, [t.Identifier('this')].concat(targetPath.node.arguments)
    ));
  }
  
  function es5Class(_class) {
    var _es5Class = [_class.constructor], MyClass = _class.id;
    // parent class
    if (_class.parentId) {
      // MyClass.prototype = Object.create(MyParentClass.prototype);
      _es5Class.push( assign( 
        expression(MyClass, 'prototype'), 
        objectCreate(expression(_class.parentId, 'prototype')) 
      ));
      // force the prototype.constructor property to make new.target / this.constructor valid
      _class.methods.push(t.objectProperty(t.identifier('constructor'), MyClass));
    }
    // methods
    if (_class.methods.length > 0) {
      // Object.assign(MyClass.prototype, { /* my methods *//});
      _es5Class.push( objectAssign(expression(MyClass, 'prototype'), _class.methods) );
    }
    // statics
    if (_class.statics.length > 0) {
      // Object.assign(MyClass, { /* my statics *//});
      _es5Class.push( objectAssign(MyClass, _class.statics) );
    }
    return _es5Class;
  }
  
  return {
    name: "transform-class",
    visitor: visitor
  };
}
