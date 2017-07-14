'use strict';

const _ = require('lodash');
const omit = require('./omit');
const defaultOptions = require('./options');

module.exports = options => {

  const opts = _.merge({}, defaultOptions, options);
  const omitFields = (!!opts.fieldsToOmit) ? omit(opts.fieldsToOmit) : json => json;
  
  return (res, promise) => promise.then(json => {
    if (!json) {
      return res.status(204).send(); 
    }
    return res.status(200).json(opts.sanitizer(omitFields(json)));
  }, error => {
    if (Array.isArray(error)) {
      return res.status(400).json(error);
    }
    return (error) ? res.status(500).json({ error }) : res.status(404).send(); 
  });
};
