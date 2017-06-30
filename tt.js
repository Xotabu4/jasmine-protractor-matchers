let __ = require('arguejs')

function person(){
  var signature = {elem: Object, browser: Object, className: String, timeout: [Number], message: [String]};
  args = __(signature, arguments);
  // String name is now referenced by arguments.name
  // Number age is now referenced by arguments.age
  return args;
}

console.log(person({}, {}, 'hello'))
console.log(person({}, {}, 'hello', 'error'))
console.log(person({}, {}, 'hello', 2000, 'error'))


