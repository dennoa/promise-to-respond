'use strict';

const _ = require('lodash');
const respond = require('../lib');
const expect = require('chai').expect;
const sinon = require('sinon');

describe('respond - fields to omit', ()=> {
  let respondInstance, res, resStatus, resSend, resJson;

  beforeEach(()=> {
    respondInstance = respond();
    resSend = sinon.stub();
    resJson = sinon.stub();
    resStatus = sinon.stub().returns({ send: resSend, json: resJson });
    res = { status: resStatus };
  });

  it('should allow fieldsToOmit to specify a single field', done => {
    respondInstance = respond({
      fieldsToOmit: '_id'
    });
    const json = { _id: 'sdfdsf', result: 'my result' };
    respondInstance(res, Promise.resolve(json)).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      const result = resJson.firstCall.args[0];
      expect(result.result).to.equal(json.result);
      expect(typeof result._id).to.equal('undefined');
      done();
    });
  });

  it('should allow fieldsToOmit to specify multiple fields', done => {
    respondInstance = respond({
      fieldsToOmit: ['_id', '__v']
    });
    const json = { _id: 'sdfdsf', __v: 0, result: 'my result' };
    respondInstance(res, Promise.resolve(json)).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      const result = resJson.firstCall.args[0];
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
    const docs = [{ _id: 'sdfdsf', __v: 0, result: 'my result' },{ _id: 'sdfdsf', __v: 0, result: 'my other result' }];
    respondInstance(res, Promise.resolve(docs)).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      const result = resJson.firstCall.args[0];
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
    const docs = { myarr: [{ _id: 'sdfdsf', __v: 0, result: 'my result' },{ _id: 'sdfdsf', __v: 0, result: 'my other result' }] };
    respondInstance(res, Promise.resolve(docs)).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      const result = resJson.firstCall.args[0];
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
    const docs = { myarr: [{ someDate: new Date(), nested: { arr: [{ ignore: 'me', keep: true }]}, result: 'my result' }] };
    respondInstance(res, Promise.resolve(docs)).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      const result = resJson.firstCall.args[0];
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
    const docs = { myarr: [{ someDate: new Date(), nested: { arr: null }, result: 'my result' }] };
    respondInstance(res, Promise.resolve(docs)).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      const result = resJson.firstCall.args[0];
      expect(result.myarr[0].nested.arr).to.equal(null);
      done();
    });
  });

  it('should apply fieldsToOmit after the toJSON function', done => {
    respondInstance = respond({
      toJSON: docs => {
        docs.forEach(doc => expect(!!doc._id).to.equal(true));
        return docs;
      },
      fieldsToOmit: ['_id', '__v']
    });
    const docs = [{ _id: 'sdfdsf', __v: 0, result: 'my result' }, { _id: 'sdfdsf', __v: 0, result: 'my other result' }];
    respondInstance(res, Promise.resolve(docs)).then(()=> {
      expect(resStatus.calledWith(200)).to.be.true;
      expect(resJson.firstCall.args[0]).to.deep.equal([{ result: 'my result' }, { result: 'my other result' }]);
      done();
    });
  });

});