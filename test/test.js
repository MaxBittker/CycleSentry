var assert = require('assert');
var superagent = require('superagent');
var server = require('../server.js');
var status = require('http-status');
var http = require('http');

var testingID = 0;
var app = -1;

describe('/api/stress/', function() {

    before(function(done) {
        app = server(5555, "test", done);
    });

    it('inserts doc', function(done) {
        superagent.get('http://localhost:5555/api/insertUser/123/testuser/qwerty').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            assert(res.text.length !== 0);
            done();
        });
    });

    it('insert tag', function(done) {
        superagent.get('http://localhost:5555/api/insertTag/123/456/bike/cooltag').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            assert(res.text.length !== 0);
            done();
        });
    });

    it('user info is correct after tag is added', function(done) {
        superagent.get('http://localhost:5555/api/getUserInfo/123').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            var retobj = JSON.parse(res.text)
            // console.log(retobj.)
            assert.equal(retobj.UID, "123");
            assert.equal(retobj.name, "testuser");
            // assert.equal(retobj.password, "qwerty");
            // assert.equal(retobj.state.location, '-1');

            done();
        });
    });


    it('update tagstatus 10000 times', function(done) {
        for(var n = 0; n<=10000; n++){
            superagent.get('http://localhost:5555/api/updateTag/456/'+n).end(function(err, res) {
                assert.ifError(err);
                assert.equal(res.status, status.OK);
                // console.log(res.text);
                assert.equal(res.text, '1');
                done();
            });
        }
    });

    it('status was changed to C', function(done) {
        superagent.get('http://localhost:5555/api/getUserInfo/123').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);

            var retobj = JSON.parse(res.text)
            assert.equal(retobj.UID, "123");
            assert.equal(retobj.tagInfo[0].state.location, "10000");

            assert.equal(retobj.name, "testuser");
            // assert.equal(retobj.signedIn, '1');

            done();
        });
    });


});

describe('/api/insert/', function() {

    before(function(done) {
        app = server(3333, "test", done);
    });

    it('inserts doc', function(done) {
        superagent.get('http://localhost:3333/api/insertUser/123/testuser/qwerty').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            assert(res.text.length !== 0);
            done();
        });
    });

    it('user info is correct after creation', function(done) {
        superagent.get('http://localhost:3333/api/getUserInfo/123').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            var retobj = JSON.parse(res.text)
                // console.log(retobj)
            assert.equal(retobj.UID, "123");
            assert.equal(retobj.name, "testuser");
            // assert.equal(retobj.password, "qwerty");
            // assert.equal(retobj.state.location, '-1');

            done();
        });
    });

    it('insert tag', function(done) {
        superagent.get('http://localhost:3333/api/insertTag/123/456/bike/cooltag').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            assert(res.text.length !== 0);
            done();
        });
    });

    it('user info is correct after tag is added', function(done) {
        superagent.get('http://localhost:3333/api/getUserInfo/123').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            var retobj = JSON.parse(res.text)
            // console.log(retobj.)
            assert.equal(retobj.UID, "123");
            assert.equal(retobj.name, "testuser");
            // assert.equal(retobj.password, "qwerty");
            // assert.equal(retobj.state.location, '-1');

            done();
        });
    });
    it('get location info', function(done) {
        superagent.get('http://localhost:3333/api/getLocationInfo').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            var retobj = JSON.parse(res.text)
            assert.equal(retobj[0].occupancy, '0');
            done();
        });
    });

    it('update tagstatus to 1', function(done) {
        superagent.get('http://localhost:3333/api/updateTag/456/1').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            assert.equal(res.text, '1');
            done();
        });
    });

    it('status was changed to 1', function(done) {
        superagent.get('http://localhost:3333/api/getUserInfo/123').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);

            var retobj = JSON.parse(res.text)
            assert.equal(retobj.UID, "123");
            assert.equal(retobj.tagInfo[0].state.location, "1");

            assert.equal(retobj.name, "testuser");
            // assert.equal(retobj.signedIn, '1');

            done();
        });
    });

    it('check location info changed after tag checks in', function(done) {
        superagent.get('http://localhost:3333/api/getLocationInfo').end(function(err, res) {
            assert.ifError(err);
            assert.equal(res.status, status.OK);
            // console.log(res.text);
            var retobj = JSON.parse(res.text)
            assert.equal(retobj[0].occupancy, '1');
            done();
        });
    });
    // it('serves /', function(done) {
    //     superagent.get('http://localhost:3333/').end(function(err, res) {
    //         assert.ifError(err);
    //         assert.equal(res.status, status.OK);
    //         // console.log(res.text);
    //         assert(res.text.indexOf("testing123") > 0);
    //         done();
    //     });
    // });

});
