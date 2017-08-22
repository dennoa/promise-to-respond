'use strict';

const _ = require('lodash');
const omit = require('./omit');
const defaultOptions = require('./options');

const isUndefined = obj => (typeof obj === 'undefined');
const isExpectedError = Array.isArray;

module.exports = options => {

  const opts = _.merge({}, defaultOptions, options);
  const toJSON = opts.toJSON || (json => json);
  const omitFields = (!!opts.fieldsToOmit) ? omit(opts.fieldsToOmit) : (json => json);

  const respond = {
    noData: res => res.status(204).send(),
    sendJSON: res => json => res.status(200).json(omitFields(json)),
    notFound: res => res.status(404).send(),
    sendError: res => error => isExpectedError(error) ? res.status(400).json(error): res.status(500).json({ error }),
  };
    
  const handleSuccess = res => result => {
    if (isUndefined(result)) {
      return respond.noData(res);
    }
    return Promise.resolve(toJSON(result)).then(respond.sendJSON(res));
  };
  
  const handleError = res => result => {
    if (isUndefined(result)) {
      return respond.notFound(res);
    }
    return Promise.resolve(toJSON(result)).then(respond.sendError(res));
  };
  
  return (res, promise) => promise
    .then(handleSuccess(res), handleError(res))
    .catch(respond.sendError(res));
};
