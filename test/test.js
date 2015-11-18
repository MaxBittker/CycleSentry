var assert = require('assert');
var superagent = require('superagent');
var server = require('../server.js');
var status = require('http-status');
var http = require('http');

var testingID = 0;
var app = -1;

describe('/api/insert/', function() {

    before(function(done) {
        app = server(3000, done);
    });

    it('inserts doc', function(done) {
        superagent.get('http://localhost:3000/api/insertUser/testing123').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            assert(res.text.length !== 0);
            done();
        });
    });
    it('list users', function(done) {
        superagent.get('http://localhost:3000/api/listUsers').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            assert(res.text.indexOf("testing1230") > 0);
            done();
        });
    });
    it('update record', function(done) {
        superagent.get('http://localhost:3000/api/signUser/testing123/1').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            assert(res.text === '1');
            done();
        });
    });
    it('state changed', function(done) {
        superagent.get('http://localhost:3000/api/listUsers').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            assert(res.text.indexOf("testing1231") > 0);
            done();
        });
    });
    // it('serves /', function(done) {
    //     superagent.get('http://localhost:3000/').end(function(err, res) {
    //         assert.ifError(err);
    //         assert.equal(res.status, status.OK);
    //         // console.log(res.text);
    //         assert(res.text.indexOf("testing123") > 0);
    //         done();
    //     });
    // });

});
