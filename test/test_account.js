var conf = require('../config');
var express = require('express');
var mongoose = require('mongoose');
var should = require('should');
var assert = require('assert');
var request = require('supertest');
var http = require('http');
var APP = require("../app").app;


describe('Account', function () {
    var url = 'https://apicatus-c9-bmaggi.c9.io';
    var server = null;
    var app = null;
    // within before() you can run all the operations that are needed to setup your tests. In this case
    // I want to create a connection with the database, and when I'm done, I call done().
    before(function(done) {
        function clearCollections() {
          for (var collection in mongoose.connection.collections) {
              mongoose.connection.collections[collection].remove(function () {});
          }
        }
        function startServer() {
            APP.listen(process.env.PORT, process.env.IP);
        }
        mongoose.connect('mongodb://admin:admin@alex.mongohq.com:10062/cloud-db');
        mongoose.connection.on("open", function() {
            clearCollections();
            startServer();
            done();
        });
    })
    after(function (done) {
        function clearCollections() {
          for (var collection in mongoose.connection.collections) {
              mongoose.connection.collections[collection].remove(function () {});
          }
        }
        clearCollections();
        mongoose.disconnect();
        return done();
    });

    describe('User management', function() {
        it('should crete a new user', function() {
            var url = 'http://' + process.env.IP + ':' + process.env.PORT;
            var profile = {
                username: 'admin',
                password: 'admin'
            };
            request(url)
                .post('/signup')
                .send(profile)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function(err, res) {
                    if (err) throw err;
                });
        });
        it('should not allow registering en existing with same id as existing one', function() {
            var url = 'http://' + process.env.IP + ':' + process.env.PORT;
            var profile = {
                username: 'admin',
                password: 'admin'
            };
            request(url)
                .post('/signup')
                .send(profile)
                .expect('Content-Type', /json/)
                .expect(503)
                .end(function(err, res) {
                    if (err) throw err;
                });
        });
        it('should be able to login', function() {
            var url = 'http://' + process.env.IP + ':' + process.env.PORT;
            var profile = {
                username: 'admin',
                password: 'admin'
            };
            request(url)
                .post('/signup')
                .send(profile)
                .expect('Content-Type', /json/)
                .expect(503)
                .end(function(err, res) {
                    if (err) throw err;
                });
        });
        it('should be able to signout', function() {

        });
        it('should be able to delete a user account', function() {

        });
    })
});
