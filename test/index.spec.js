'use strict';

const _ = require('lodash');
const respond = require('../lib');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('respond', ()=> {
  let respondInstance, res, resStatus, resSend, resJson;

  beforeEach(()=> {
    respondInstance = respond();
    resSend = sinon.stub();
    resJson = sinon.stub();
    resStatus = sinon.stub().returns({ send: resSend, json: resJson });
    res = { status: resStatus };
  });

  it('should respond with 204 on success with no content', (done)=> {
    respondInstance(res, Promise.resolve()).then(()=> {
      expect(resStatus.calledWith(204)).to.be.true;
      expect(resSend.calledOnce).to.be.true;
      done();
    });
  });

  it('should respond with 200 on success with content', (done)=> {
    const json = { result: 'my result' };
    respondInstance(res, Promise.resolve(json)).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      expect(resJson.calledWith(json)).to.be.true;
      done();
    });
  });

  it('should allow a custom toJSON function to be specified', done => {
    respondInstance = respond({
      toJSON: json => _.omit(json, '_id')
    });
    const json = { _id: 'sdfdsf', result: 'my result' };
    respondInstance(res, Promise.resolve(json)).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      const result = resJson.firstCall.args[0];
      expect(resJson.firstCall.args[0]).to.deep.equal({ result: json.result });
      done();
    });
  });

  it('should allow the custom toJSON function to return a Promise', done => {
    respondInstance = respond({
      toJSON: json => new Promise(resolve => process.nextTick(() => resolve(_.omit(json, '_id'))))
    });
    const json = { _id: 'sdfdsf', result: 'my result' };
    respondInstance(res, Promise.resolve(json)).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      expect(resJson.firstCall.args[0]).to.deep.equal({ result: json.result });
      done();
    });
  });

  it('should respond with an error if the custom toJSON function fails', done => {
    const fail = new Error('failed');
    respondInstance = respond({
      toJSON: json => new Promise((resolve, reject) => process.nextTick(() => { reject(fail); }))
    });
    const json = { _id: 'sdfdsf', result: 'my result' };
    respondInstance(res, Promise.resolve(json)).then(()=> {
      expect(resStatus.calledWith(500)).to.be.true;
      expect(resJson.firstCall.args[0]).to.deep.equal({ error: fail });
      done();
    });
  });

});