'use strict';

const _ = require('lodash');

module.exports = fieldsToOmit => {

  function handleNestedPaths(obj, pathsToUnset) {
    let childPaths = {};
    _.forEach(pathsToUnset, path => {
      let bits = path.split('.');
      if ((bits.length > 1) && (typeof obj[bits[0]] === 'object')) {
        let parent = bits[0];
        let child = [bits.splice(1).join('.')];
        childPaths[parent] = (childPaths[parent]) ? childPaths[parent].concat(child) : child; 
      }
    });
    _.forEach(childPaths, (paths, key) => {
      obj[key] = removeFieldsFromObj(obj[key], paths);
    });
  }

  function removeFieldsFromObj(obj, pathsToUnset) {
    if (typeof obj !== 'object') { return obj; }
    if (obj instanceof Array) {
      return _.map(obj, item => removeFieldsFromObj(item, pathsToUnset));
    }
    let o = obj.toObject ? obj.toObject(): _.merge({}, obj);
    _.forEach(pathsToUnset, path => _.unset(o, path));
    handleNestedPaths(o, pathsToUnset);
    return o;
  }

  let pathsToUnset = (fieldsToOmit instanceof Array) ? fieldsToOmit: [fieldsToOmit];
  return json => removeFieldsFromObj(json, pathsToUnset);
  
};