'use strict';

module.exports = {
  toJSON: result => {
    return (typeof (result || {}).toJSON === 'function') ? result.toJSON() : result;
  },
  fieldsToOmit: null,
};
