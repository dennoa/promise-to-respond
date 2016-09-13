'use strict';

const _ = require('lodash');

module.exports = fieldsToOmit => {

  function removeFieldsFromObj(obj) {
    let o = (obj && obj.toObject) ? obj.toObject(): obj;
    return _.omit(o, fieldsToOmit);
  }

  return (json) => {
    if (json instanceof Array) {
      return _.map(json, removeFieldsFromObj)
    }
    return removeFieldsFromObj(json);
  }
  
};