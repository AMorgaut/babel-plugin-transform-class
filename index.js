export default function (babel) {

  const 
      t = babel.types,
      prototype = t.identifier("prototype");
      
  var
      _class,
      superIdentifier;
  
  
  function objectAssign(target, members) {
    return t.expressionStatement(t.callExpression(
      t.memberExpression(
        t.identifier("Object"), 
        t.identifier("assign")
      ),
      [target, members]
    ));
  }
  
  function objectCreate(proto) {
    return t.callExpression(
      t.memberExpression(
        t.identifier("Object"), 
        t.identifier("create")
      ),
      [proto]
    );
  }
  
  function assign(key, value) {
    return t.expressionStatement(t.assignmentExpression('=', key, value));
  }
  
  function es5Method(method) {
    var id = method.key;
    return t.objectProperty(id, t.functionExpression(id, method.params, method.body));
  }
  
  function createClass(path) {
      return { 
        path, 
        id: path.node.id, 
        parentId: path.node.superClass || t.identifier('Function'),
        statics: [], methods: [] };
  }
  
  function superCall(path) {
    var targetPath, superTarget, method, args = [];
    if (path.parent.type ==="MemberExpression") {
      targetPath = path.parentPath;
      method = targetPath.node.property;
      targetPath = targetPath.parentPath;
      // ParentClass.prototype.methodName
      superTarget = t.memberExpression(
        t.memberExpression(_class.parentId, t.identifier("prototype")), method
      );
    } else {
      targetPath = path.parentPath;
      // ParentClass.call
      superTarget = t.memberExpression(_class.parentId, t.identifier("call"));
    }
    args = [t.Identifier('this')].concat(targetPath.node.arguments);
    targetPath.replaceWith(
      t.callExpression(superTarget, args)
    );
  }
  
  function exportClass(t, path, _class) {
    // constructeur
    var 
        _export = [_class.constructor],
        proto;
    // parent class
    if (_class.parentId) {
      // MyClass.prototype = Object.create(MyParentClass);
      _export.push(assign(
          t.memberExpression(_class.id, prototype), 
          objectCreate(_class.parentId)
      ));
    }
    // methods
    if (_class.methods.length > 0) {
      // Object.assign(MyClass.prototype, { /* my methods *//});
      _export.push(objectAssign(
          t.memberExpression(_class.id, prototype), 
          t.objectExpression(_class.methods)
      ));
    }
    // statics
    if (_class.statics.length > 0) {
      // Object.assign(MyClass, { /* my statics *//});
      _export.push(objectAssign(
        _class.id, 
        t.objectExpression(_class.statics)
      ));
    }
    
    return path.replaceWithMultiple(_export);
  }
  
  return {
    name: "transform-class",
    visitor: {
        // separate export from class declaration
      ExportDefaultDeclaration: function ExportDefaultDeclaration(path) {
        if (!path.get("declaration").isClassDeclaration()) {
          return;
        }
        var node = path.node;
        var ref = node.declaration.id || path.scope.generateUidIdentifier("class");
        console.log('ExportDefaultDeclaration ref', ref);
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
      Super(path) {
       console.log('Super Call', path.node);
        superCall(path);
      },
      // METHODS
      ClassMethod(path) {
        var node = path.node;
        // CONSTRUCTOR
        if (node.kind === 'constructor') {
          console.log('Constructor', node);
          _class.constructor = t.functionDeclaration(_class.id,  node.params, node.body);
          return;
        }
        // STATIC METHODS
        if (node.static) {
          console.log('Static Method', node);
          _class.statics.push(es5Method(node));
          return;
        }
        // PROTOTYPE METHODS
        console.log(path.type, node);
        _class.methods.push(es5Method(node));
      }
    }
  };
}
