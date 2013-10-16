var should = require('should');
var assert = require('assert');
var request = require('supertest');
var mongoose = require('mongoose');
var digestor = require('../digestors/deedee');
//var digestor = require("../controllers/digestor");

describe('HTTP Methods Statuses ContentTypes', function(){
    describe('#index Of', function(){
        it('should return 1 when the value is not present', function(){
            digestor.headers().statuses[1].id.should.equal(101);
            digestor.headers().statuses[2].id.should.equal(102);
        });
    });
    describe('#position Of', function(){
        it("should return position of char in a string 'cool'", function(){
          'cool'.indexOf('c').should.equal(0);
          'cool'.indexOf('l').should.equal(3);
        });
    });
});