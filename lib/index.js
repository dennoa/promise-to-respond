'use strict';

const _ = require('lodash');
const omit = require('./omit');
const defaultOptions = require('./options');

module.exports = options => {

  const opts = _.merge({}, defaultOptions, options);
  
  function sanitize(json) {
    const omittedFields = (!!opts.fieldsToOmit) ? omit(opts.fieldsToOmit)(json) : json;
    return opts.sanitizer(omittedFields);
  }
  
  return (res, promise) => promise.then(json => {
    if (!!json) {
      return res.status(200).json(sanitize(json));
    }
    return res.status(204).send(); 
  }, error => {
    if (error instanceof Array) {
      return res.status(400).json(error);
    }
    if (!!error) {
      return res.status(500).json({ error });
    }
    return res.status(404).send(); 
  });
};
