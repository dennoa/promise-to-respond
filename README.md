# promise-to-respond

Simple function to help with consistent responses when using express.


## Installation

    npm install --save promise-to-respond

## Example usage

    const respond = require('promise-to-respond')();
    const router = require('express').Router();

    router.get('/:key', (req, res) => {
      respond(res, new Promise((resolve, reject) => {
        resolve({ some: 'data' });
      }));
    });

## Rules

* A resolved promise with a truthy result responds with 200
* A resolved promise with a falsy result responds with 204
* A rejected promise with an array responds with 400
* A rejected promise with any other truthy result responds with 500 a body like this: { error: result }
* A rejected promise with a falsy result responds with 404

## Options

### sanitizer

You can initialise promise-to-respond with a sanitizer function that will be called in the case of a 200 response to transform the response body as required.

    const respond = require('promise-to-respond')({
      sanitizer: json => {
        //TODO convert json to something else and return the result
      }
    });
