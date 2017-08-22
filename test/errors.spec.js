'use strict';

const _ = require('lodash');
const respond = require('../lib');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('respond with custom errors', ()=> {
  let respondInstance, res, resStatus, resSend, resJson;

  beforeEach(()=> {
    respondInstance = respond();
    resSend = sinon.stub();
    resJson = sinon.stub();
    resStatus = sinon.stub().returns({ send: resSend, json: resJson });
    res = { status: resStatus };
  });

  it('should respond with 400 where an array of errors was supplied', (done)=> {
    const errors = [{ param: 'myField', msg: 'required' }];
    respondInstance(res, Promise.reject(errors)).then(()=> {
      expect(resStatus.calledWith(400)).to.be.true;
      expect(resJson.calledWith(errors)).to.be.true;
      done();
    });
  });

  class ValidationError extends Error {
    constructor(errors) {
      super('Validation failed');
      this.name = this.constructor.name;
      this.errors = errors;
    }
    toJSON() {
      return this.errors;
    }
  }

  it('should respond with 400 where an error with a toJSON method that returns an array was thrown', (done)=> {
    const errors = [{ param: 'myField', msg: 'required' }];
    const failedPromise = new Promise(() => {
      throw new ValidationError(errors);
    });
    respondInstance(res, failedPromise).then(()=> {
      expect(resStatus.calledWith(400)).to.be.true;
      expect(resJson.calledWith(errors)).to.be.true;
      done();
    });
  });

  it('should respond with 500 where an error with a toJSON method that does not return an array was thrown', (done)=> {
    const errors = { some: 'thing', went: 'wrong' };
    const failedPromise = new Promise(() => {
      throw new ValidationError(errors);
    });
    respondInstance(res, failedPromise).then(()=> {
      expect(resStatus.calledWith(500)).to.be.true;
      expect(resJson.firstCall.args[0]).to.deep.equal({ error: errors });
      done();
    });
  });

  it('should respond with 404 where no error was supplied', (done)=> {
    respondInstance(res, Promise.reject()).then(()=> {
      expect(resStatus.calledWith(404)).to.be.true;
      done();
    });
  });

  it('should respond with 500 where a null error was supplied', (done)=> {
    respondInstance(res, Promise.reject(null)).then(()=> {
      expect(resStatus.calledWith(500)).to.be.true;
      expect(resJson.firstCall.args[0]).to.deep.equal({ error: null });
      done();
    });
  });

  it('should respond with 500 where an error string was supplied', (done)=> {
    const errors = 'crap';
    respondInstance(res, Promise.reject(errors)).then(()=> {
      expect(resStatus.calledWith(500)).to.be.true;
      const msg = resJson.firstCall.args[0];
      expect(resJson.firstCall.args[0]).to.deep.equal({ error: errors });
      done();
    });
  });

  it('should respond with 500 where any non-array object was supplied', (done)=> {
    const errors = { fail: 'oops' };
    respondInstance(res, Promise.reject(errors)).then(()=> {
      expect(resStatus.calledWith(500)).to.be.true;
      expect(resJson.firstCall.args[0]).to.deep.equal({ error: errors });
      done();
    });
  });

});