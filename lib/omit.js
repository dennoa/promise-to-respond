'use strict';

const _ = require('lodash');

module.exports = fieldsToOmit => {

  function removeFieldsFromObj(obj) {
    if (!obj || (typeof obj !== 'object')) {
      return obj;
    }
    if (obj instanceof Array) {
      return _.map(obj, removeFieldsFromObj);
    }
    let o = obj.toObject ? obj.toObject(): obj;
    return _.mapValues(_.omit(o, fieldsToOmit), (value, key) => {
      return (key === '_id') ? value: removeFieldsFromObj(value);
    });
  }

  return removeFieldsFromObj;
  
};