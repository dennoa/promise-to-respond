'use strict';

const _ = require('lodash');

module.exports = fieldsToOmit => {

  function unsetNestedPaths(obj, pathsToUnset) {
    const childPaths = {};
    pathsToUnset.forEach(path => {
      const bits = path.split('.');
      if ((bits.length > 1) && (typeof obj[bits[0]] === 'object')) {
        const parent = bits[0];
        const child = [bits.splice(1).join('.')];
        childPaths[parent] = (childPaths[parent]) ? childPaths[parent].concat(child) : child; 
      }
    });
    _.forEach(childPaths, (paths, key) => {
      obj[key] = unsetPaths(obj[key], paths);
    });
  }

  function unsetPaths(obj, pathsToUnset) {
    if (!obj || (typeof obj !== 'object')) { return obj; }
    if (obj instanceof Array) {
      return obj.map(item => unsetPaths(item, pathsToUnset));
    }
    const o = obj.toObject ? obj.toObject(): Object.assign({}, obj);
    pathsToUnset.forEach(path => _.unset(o, path));
    unsetNestedPaths(o, pathsToUnset);
    return o;
  }

  const pathsToUnset = Array.isArray(fieldsToOmit) ? fieldsToOmit: [fieldsToOmit];
  return obj => unsetPaths(obj, pathsToUnset);  
};
