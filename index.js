export default function (babel) {

  const 
      t = babel.types,
      prototype = t.identifier("prototype");
      
  var
      _class,
      superIdentifier;
  
  
  function objectAssign(target, members) {
    return t.expressionStatement(t.callExpression(
      // Object.assign(target, members)
      t.memberExpression(t.identifier("Object"), t.identifier("assign")), [target, t.objectExpression(members)]
    ));
  }
  
  function objectCreate(parentClass) {
    return t.callExpression(
      // Object.create(parentClass)
      t.memberExpression(t.identifier("Object"), t.identifier("create")), [parentClass]
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
  
  function createClass(path) {
      return { 
        path, 
        id: path.node.id, 
        parentId: path.node.superClass || t.identifier('Function'),
        statics: [], methods: [] 
      };
  }
  
  function superCall(path) {
    var targetPath, superTarget, method, args = [];
    if (path.parent.type ==="MemberExpression") {
      targetPath = path.parentPath;
      method = targetPath.node.property;
      targetPath = targetPath.parentPath;
      // ParentClass.prototype.methodName.apply(this, args)
      superTarget = t.memberExpression(t.memberExpression(t.memberExpression(
        _class.parentId, t.identifier("prototype")), method), t.identifier('apply')
      );
    } else {
      targetPath = path.parentPath;
      // ParentClass.apply(this, args)
      superTarget = t.memberExpression(_class.parentId, t.identifier("apply"));
    }
    args = [t.Identifier('this')].concat(targetPath.node.arguments);
    targetPath.replaceWith(t.callExpression(superTarget, args));
  }
  
  function exportClass(t, path, _class) {
    // constructeur
    var _export = [_class.constructor];
    // parent class
    if (_class.parentId) {
      // MyClass.type = Object.create(MyParentClass);
      _export.push( assign(t.memberExpression(_class.id, prototype), objectCreate(_class.parentId)) );
    }
    // methods
    if (_class.methods.length > 0) {
      // Object.assign(MyClass.prototype, { /* my methods *//});
      _export.push( objectAssign(t.memberExpression(_class.id, prototype), _class.methods) );
    }
    // statics
    if (_class.statics.length > 0) {
      // Object.assign(MyClass, { /* my statics *//});
      _export.push( objectAssign(_class.id, _class.statics) );
    }
    return path.replaceWithMultiple(_export);
  }
  
  return {
    name: "transform-class",
    visitor: {
        // separate export from class declaration
      ExportDefaultDeclaration(path) {
        if (!path.get("declaration").isClassDeclaration()) { return; }
        var node = path.node, ref = node.declaration.id || path.scope.generateUidIdentifier("class");
        path.replaceWith(node.declaration);
        // put export before class declaration
        path.insertBefore(t.exportDefaultDeclaration(ref));
      },
      // CLASS
      ClassDeclaration: {
        enter(path) {_class = createClass(path)},
        exit(path)  {exportClass(t, path, _class)}
      },
      // SUPER CALL
      Super(path) { superCall(path); },
      // METHODS
      ClassMethod(path) {
        var node = path.node;
        if (node.kind === 'constructor') { // CONSTRUCTOR
          _class.constructor = t.functionDeclaration(_class.id,  node.params, node.body); return;
        }
        if (node.static) { // STATIC METHODS
          _class.statics.push(es5Method(node)); return;
        }
        // PROTOTYPE METHODS
        _class.methods.push(es5Method(node));
      }
    }
  };
}
