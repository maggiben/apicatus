var conf = require('../config');
var express = require('express');
var mongoose = require('mongoose');
var should = require('should');
var assert = require('assert');
var request = require('supertest');
var http = require('http');
var APP = require("../app").app;


describe('Apicatus test suite', function () {
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
            var server = require('http').createServer(APP)
            server.listen(conf.listenPort);
            return server;
        }
        if(mongoose.connection.readyState === 0) {
            mongoose.connect('mongodb://admin:admin@alex.mongohq.com:10062/cloud-db');
        }

        mongoose.connection.on("open", function() {
            clearCollections();
            server = startServer();
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
        mongoose.disconnect(function() {
            server.close(function() {
                return done();
            });
        })
    });

    describe('User Management', function () {
        describe('CURD Operations', function() {
            it('should crete a new user', function(done) {
                var url = 'http://' + conf.ip + ':' + conf.listenPort;
                var profile = {
                    username: 'admin',
                    password: 'admin'
                };
                request(url)
                    .post('/user')
                    .set('Content-Type', 'application/json')
                    .send(profile)
                    .expect('Content-Type', /json/)
                    .expect(201)
                    .end(function(err, res) {
                        if (err) throw err;
                        res.body.username.should.equal('admin')
                        return done();
                    });
            });
            it('should not allow registering en existing with same id as existing one', function(done) {
                var url = 'http://' + conf.ip + ':' + conf.listenPort;
                var profile = {
                    username: 'admin',
                    password: 'admin'
                };
                request(url)
                    .post('/user')
                    .send(profile)
                    .expect('Content-Type', /json/)
                    .expect(409)
                    .end(function(err, res) {
                        if (err) throw err;
                        res.statusCode.should.equal(409)
                        return done();
                    });
            });
            it('should be able to login', function(done) {
                var url = 'http://' + conf.ip + ':' + conf.listenPort;
                var profile = {
                    username: 'admin',
                    password: 'admin'
                };
                request(url)
                    .post('/user/signin')
                    .send(profile)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        res.body.username.should.equal('admin');
                        return done();
                    });
            });
            it('should be able to signout', function(done) {
                var url = 'http://' + conf.ip + ':' + conf.listenPort;
                request(url)
                    .get('/user/signout')
                    .expect(204)
                    .end(function(err, res) {
                        if (err) throw err;
                        res.statusCode.should.equal(204)
                        return done();
                    });
            });
            it('should be able to delete a user account', function(done) {
                var url = 'http://' + conf.ip + ':' + conf.listenPort;
                var profile = {
                    username: 'admin',
                    password: 'admin'
                };
                request(url)
                    .post('/user/signin')
                    .send(profile)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        res.body.username.should.equal('admin')
                        var cookie = res.headers['set-cookie'];
                        request(url)
                            .del('/user')
                            .set('cookie', cookie)
                            .expect(204)
                            .end(function(err, res) {
                                if (err) throw err;
                                res.statusCode.should.equal(204)
                                return done();
                            });
                    });
            });
        });
        describe('Authentication', function() {
            it('should be able to login', function(done) {
                var url = 'http://' + conf.ip + ':' + conf.listenPort;
                var profile = {
                    username: 'admin',
                    password: 'admin'
                };
                request(url)
                    .post('/user')
                    .set('Content-Type', 'application/json')
                    .send(profile)
                    .expect('Content-Type', /json/)
                    .end(function(err, res) {
                        if (err) throw err;
                        res.body.username.should.equal('admin')
                        var cookie = res.headers['set-cookie'];
                        request(url)
                            .post('/user/signin')
                            .set('cookie', cookie)
                            .send(profile)
                            .expect('Content-Type', /json/)
                            .expect(200)
                            .end(function(err, res) {
                                if (err) throw err;
                                res.body.username.should.equal('admin');
                                return done();
                            });
                    });
            });
            it('should be able to signout', function(done) {
                var url = 'http://' + conf.ip + ':' + conf.listenPort;
                request(url)
                    .get('/user/signout')
                    .expect(204)
                    .end(function(err, res) {
                        if (err) throw err;
                        res.statusCode.should.equal(204)
                        return done();
                    });
            });
        });
    });
    describe('Digestor Management', function () {
        var cookie = null;
        before(function(done) {
            var url = 'http://' + conf.ip + ':' + conf.listenPort;
            var profile = {
                username: 'admin',
                password: 'admin'
            };
            // Create User
            /*request(url)
                .post('/user')
                .set('Content-Type', 'application/json')
                .send(profile)
                .expect('Content-Type', /json/)
                .expect(201)
                .end(function(err, res) {
                    if (err) throw err;
                    res.body.username.should.equal('admin')
                    cookie = res.headers['set-cookie'];
                    return done();
                });*/

                request(url)
                    .post('/user/signin')
                    .send(profile)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        res.body.username.should.equal('admin');
                        cookie = res.headers['set-cookie'];
                        return done();
                    });
        });
        describe('CURD Operations', function() {
            it('should crete a new digestor', function(done) {
                var url = 'http://' + conf.ip + ':' + conf.listenPort;
                var digestor = {
                    name: 'myDigestor'
                };
                request(url)
                    .post('/digestors')
                    .set('Content-Type', 'application/json')
                    .send(digestor)
                    .expect('Content-Type', /json/)
                    .expect(201)
                    .end(function(err, res) {
                        if (err) throw err;
                        res.body.name.should.equal('myDigestor');
                        return done();
                    });
            });
            it('should read all digestor', function(done) {
                var url = 'http://' + conf.ip + ':' + conf.listenPort;
                var digestor = {
                    name: 'myDigestor'
                };
                request(url)
                    .get('/digestors')
                    .set('cookie', cookie)
                    .expect('Content-Type', /json/)
                    .expect(200)
                    .end(function(err, res) {
                        if (err) throw err;
                        res.body.length.should.equal(1);
                        return done();
                    });
            });
            it('should not allow duplicates', function(done) {
                var url = 'http://' + conf.ip + ':' + conf.listenPort;
                var digestor = {
                    name: 'myDigestor'
                };
                request(url)
                    .post('/digestors')
                    .send(digestor)
                    .expect('Content-Type', /json/)
                    .expect(409)
                    .end(function(err, res) {
                        if (err) throw err;
                        res.statusCode.should.equal(409)
                        return done();
                    });
            });
        });
    });
});

