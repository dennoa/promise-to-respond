'use strict';

const respond = require('../lib');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('respond', ()=> {
  var respondInstance, res, resStatus, resSend, resJson;

  beforeEach(()=> {
    respondInstance = respond();
    resSend = sinon.stub();
    resJson = sinon.stub();
    resStatus = sinon.stub().returns({ send: resSend, json: resJson });
    res = { status: resStatus };
  });

  it('should respond with 204 on success with no content', (done)=> {
    respondInstance(res, new Promise((resolve, reject)=> {
      resolve();
    })).then(()=> {
      expect(resStatus.calledWith(204)).to.be.true;
      expect(resSend.calledOnce).to.be.true;
      done();
    });
  });

  it('should respond with 200 on success with content', (done)=> {
    let json = { result: 'my result' };
    respondInstance(res, new Promise((resolve, reject)=> {
      resolve(json);
    })).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      expect(resJson.calledWith(json)).to.be.true;
      done();
    });
  });

  it('should respond with 400 where an array of errors was supplied', (done)=> {
    let errors = [{ param: 'myField', msg: 'required' }];
    respondInstance(res, new Promise((resolve, reject)=> {
      reject(errors);
    })).then(()=> {
      expect(resStatus.calledWith(400)).to.be.true;
      expect(resJson.calledWith(errors)).to.be.true;
      done();
    });
  });

  it('should respond with 404 where no error was supplied', (done)=> {
    respondInstance(res, new Promise((resolve, reject)=> {
      reject();
    })).then(()=> {
      expect(resStatus.calledWith(404)).to.be.true;
      done();
    });
  });

  it('should respond with 500 where some other kind of errors were supplied', (done)=> {
    let errors = 'crap';
    respondInstance(res, new Promise((resolve, reject)=> {
      reject(errors);
    })).then(()=> {
      expect(resStatus.calledWith(500)).to.be.true;
      let msg = resJson.firstCall.args[0];
      expect(msg.error).to.equal(errors);
      done();
    });
  });

});