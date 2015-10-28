var assert = require('assert');
var superagent = require('superagent');
var server = require('../server.js');
var status = require('http-status');
var http = require('http');

var testingID = 0;
var app = -1;

describe('/api/insert/', function() {

    before(function() {
        app = server(3000);
    });

    it('inserts doc', function(done) {
        superagent.get('http://localhost:3000/api/insert/testing123').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            assert(res.text.length !== 0);
            done();
        });
    });

    it('serves /', function(done) {
        superagent.get('http://localhost:3000/').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            assert(res.text.indexOf("testing123") > 0);
            done();
        });
    });

});

