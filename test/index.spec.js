'use strict';

const _ = require('lodash');
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

  it('should allow a custom sanitizer to be specified', done => {
    respondInstance = respond({
      sanitizer: json => _.omit(json, '_id')
    });
    let json = { _id: 'sdfdsf', result: 'my result' };
    respondInstance(res, new Promise(resolve => resolve(json))).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      let result = resJson.firstCall.args[0];
      expect(result.result).to.equal(json.result);
      expect(typeof result._id).to.equal('undefined');
      done();
    });
  });

  it('should allow fieldsToOmit to specify a single field', done => {
    respondInstance = respond({
      fieldsToOmit: '_id'
    });
    let json = { _id: 'sdfdsf', result: 'my result' };
    respondInstance(res, new Promise(resolve => resolve(json))).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      let result = resJson.firstCall.args[0];
      expect(result.result).to.equal(json.result);
      expect(typeof result._id).to.equal('undefined');
      done();
    });
  });

  it('should allow fieldsToOmit to specify multiple fields', done => {
    respondInstance = respond({
      fieldsToOmit: ['_id', '__v']
    });
    let json = { _id: 'sdfdsf', __v: 0, result: 'my result' };
    respondInstance(res, new Promise(resolve => resolve(json))).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      let result = resJson.firstCall.args[0];
      expect(result.result).to.equal(json.result);
      expect(typeof result._id).to.equal('undefined');
      expect(typeof result.__v).to.equal('undefined');
      done();
    });
  });

  it('should apply fieldsToOmit to an array of objects', done => {
    respondInstance = respond({
      fieldsToOmit: ['_id', '__v']
    });
    let docs = [{ _id: 'sdfdsf', __v: 0, result: 'my result' },{ _id: 'sdfdsf', __v: 0, result: 'my other result' }];
    respondInstance(res, new Promise(resolve => resolve(docs))).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      let result = resJson.firstCall.args[0];
      docs.forEach((json, idx) => {
        expect(result[idx].result).to.equal(json.result);
        expect(typeof result[idx]._id).to.equal('undefined');
        expect(typeof result[idx].__v).to.equal('undefined');
      });
      done();
    });
  });

  it('should apply fieldsToOmit to an embedded array of objects', done => {
    respondInstance = respond({
      fieldsToOmit: ['myarr._id', 'myarr.__v']
    });
    let docs = { myarr: [{ _id: 'sdfdsf', __v: 0, result: 'my result' },{ _id: 'sdfdsf', __v: 0, result: 'my other result' }] };
    respondInstance(res, new Promise(resolve => resolve(docs))).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      let result = resJson.firstCall.args[0];
      docs.myarr.forEach((json, idx) => {
        expect(result.myarr[idx].result).to.equal(json.result);
        expect(typeof result.myarr[idx]._id).to.equal('undefined');
        expect(typeof result.myarr[idx].__v).to.equal('undefined');
      });
      done();
    });
  });

  it('should apply fieldToOmit to deeply nested objects', done => {
    respondInstance = respond({
      fieldsToOmit: ['myarr.nested.arr.ignore']
    });
    let docs = { myarr: [{ someDate: new Date(), nested: { arr: [{ ignore: 'me', keep: true }]}, result: 'my result' }] };
    respondInstance(res, new Promise(resolve => resolve(docs))).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      let result = resJson.firstCall.args[0];
      expect(result.myarr[0].result).to.equal(docs.myarr[0].result);
      expect(result.myarr[0].someDate.getTime()).to.equal(docs.myarr[0].someDate.getTime());
      expect(typeof result.myarr[0].nested.arr[0].ignore).to.equal('undefined');
      expect(result.myarr[0].nested.arr[0].keep).to.equal(true);
      done();
    });
  });

  it('should apply fieldToOmit to deeply nested objects with null values', done => {
    respondInstance = respond({
      fieldsToOmit: ['myarr.nested.arr.ignore']
    });
    let docs = { myarr: [{ someDate: new Date(), nested: { arr: null }, result: 'my result' }] };
    respondInstance(res, new Promise(resolve => resolve(docs))).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      let result = resJson.firstCall.args[0];
      expect(result.myarr[0].nested.arr).to.equal(null);
      done();
    });
  });

  it('should apply fieldsToOmit before a custom sanitizer', done => {
    respondInstance = respond({
      sanitizer: docs => _.filter(docs, doc => !!doc._id),
      fieldsToOmit: ['_id', '__v']
    });
    let docs = [{ _id: 'sdfdsf', __v: 0, result: 'my result' },{ _id: 'sdfdsf', __v: 0, result: 'my other result' }];
    respondInstance(res, new Promise(resolve => resolve(docs))).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      expect(resJson.calledWith([])).to.equal(true);
      done();
    });
  });

});