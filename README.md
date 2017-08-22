# promise-to-respond

Simple function to help with consistent responses when using express.


## Installation

    npm install --save promise-to-respond

## Example usage

    const respond = require('promise-to-respond')();
    const router = require('express').Router();

    router.get('/:key', (req, res) =>
      respond(res, Promise.resolve({ some: 'data' })));

## Rules

* A resolved promise with a defined or null result responds with 200
* A resolved promise with an undefined result responds with 204
* A rejected promise with an array responds with 400
* A rejected promise with an undefined result responds with 404
* A rejected promise with anything else responds with 500 and a body like this: { error }

## Options

    {
      toJSON: result => {
        return (typeof (result || {}).toJSON === 'function') ? result.toJSON() : result;
      },
      fieldsToOmit: null
    }

### toJSON

You can specify a toJSON function that will be called in the case of any response (that is not undefined) to transform the response body as required. It will be called for success responses (200) as well as error responses (400, 500). It can return a Promise or JSON.

    const respond = require('promise-to-respond')({
      toJSON: obj => new Promise((resolve, reject) => {
        //TODO convert obj to something else and return the result
      }),
    });

The default implementation checks for a toJSON function on the object and uses that if it exists. 

### fieldsToOmit

You can specify fields to be omitted from the response. This applies the omit function to all array items if the response is an array

    const respond = require('promise-to-respond')({
      fieldsToOmit: ['_id', '__v']
    });
