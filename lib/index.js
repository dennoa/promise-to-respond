'use strict';

const _ = require('lodash');

const defaultOptions = {
  sanitizer: json => json
};

module.exports = options => {

  let opts = _.merge({}, defaultOptions, options);
  
  return (res, promise) => {
    return promise
      .then(json => {
        if (!!json) {
          return res.status(200).json(opts.sanitizer(json));
        }
        return res.status(204).send(); 
      }).catch(errors => {
        if (errors instanceof Array) {
          return res.status(400).json(errors);
        }
        if (!!errors) {
          return res.status(500).json({ error: errors });
        }
        return res.status(404).send(); 
      });
  };
};