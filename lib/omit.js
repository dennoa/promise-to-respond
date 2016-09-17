'use strict';

const _ = require('lodash');

module.exports = fieldsToOmit => {

  function removeFieldsFromObj(obj) {
    if (typeof obj !== 'object') {
      return obj;
    }
    if (obj instanceof Array) {
      return _.map(obj, removeFieldsFromObj)
    }
    let o = (obj && obj.toObject) ? obj.toObject(): obj;
    return _.mapValues(_.omit(o, fieldsToOmit), removeFieldsFromObj);
  }

  return removeFieldsFromObj;
  
};