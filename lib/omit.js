'use strict';

const _ = require('lodash');

module.exports = fieldsToOmit => {

  function handleNestedPaths(obj, pathsToUnset) {
    const childPaths = {};
    _.forEach(pathsToUnset, path => {
      const bits = path.split('.');
      if ((bits.length > 1) && (typeof obj[bits[0]] === 'object')) {
        const parent = bits[0];
        const child = [bits.splice(1).join('.')];
        childPaths[parent] = (childPaths[parent]) ? childPaths[parent].concat(child) : child; 
      }
    });
    _.forEach(childPaths, (paths, key) => {
      obj[key] = removeFieldsFromObj(obj[key], paths);
    });
  }

  function removeFieldsFromObj(obj, pathsToUnset) {
    if (!obj || (typeof obj !== 'object')) { return obj; }
    if (obj instanceof Array) {
      return _.map(obj, item => removeFieldsFromObj(item, pathsToUnset));
    }
    const o = obj.toObject ? obj.toObject(): _.merge({}, obj);
    _.forEach(pathsToUnset, path => _.unset(o, path));
    handleNestedPaths(o, pathsToUnset);
    return o;
  }

  const pathsToUnset = (fieldsToOmit instanceof Array) ? fieldsToOmit: [fieldsToOmit];
  return json => removeFieldsFromObj(json, pathsToUnset);  
};
