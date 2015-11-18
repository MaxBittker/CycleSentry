var assert = require('assert');
var superagent = require('superagent');
var server = require('../server.js');
var status = require('http-status');
var http = require('http');

var testingID = 0;
var app = -1;

describe('/api/insert/', function() {

    before(function(done) {
        app = server(3000, "test", done);
    });

    it('inserts doc', function(done) {
        superagent.get('http://localhost:3000/api/insertUser/123/testuser').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            assert(res.text.length !== 0);
            done();
        });
    });
    // it('list users', function(done) {
    //     superagent.get('http://localhost:3000/api/listUsers').end(function(err, res) {
    //         assert.ifError(err);
    //         assert.equal(res.status, status.OK);
    //         // console.log(res.text);
    //         assert(res.text.indexOf("testing1230") > 0);
    //         done();
    //     });
    // });
    it('user info is correct before change', function(done) {
        superagent.get('http://localhost:3000/api/getUserInfo/123').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            var retobj = JSON.parse(res.text)
            assert.equal(retobj.id, "123");
            assert.equal(retobj.name, "testuser");
            assert.equal(retobj.signedIn, '0');

            done();
        });
    });
    it('update record to status 1', function(done) {
        superagent.get('http://localhost:3000/api/signUser/123/1').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            assert.equal(res.text, '1');
            done();
        });
    });

    it('status was changed to 1', function(done) {
        superagent.get('http://localhost:3000/api/getUserInfo/123').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);

            var retobj = JSON.parse(res.text)
            assert.equal(retobj.id, "123");
            assert.equal(retobj.name, "testuser");
            assert.equal(retobj.signedIn, '1');

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
