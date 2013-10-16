///////////////////////////////////////////////////////////////////////////////
// @file         : account.js                                                //
// @summary      : account controller                                        //
// @version      : 0.1                                                       //
// @project      : Node.JS + Express boilerplate for cloud9 and appFog       //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 12 Dec 2012                                               //
// ------------------------------------------------------------------------- //
//                                                                           //
// @copyright Copyright 2012 Benjamin Maggi, all rights reserved.            //
//                                                                           //
//                                                                           //
// License:                                                                  //
// This program is free software; you can redistribute it                    //
// and/or modify it under the terms of the GNU General Public                //
// License as published by the Free Software Foundation;                     //
// either version 2 of the License, or (at your option) any                  //
// later version.                                                            //
//                                                                           //
// This program is distributed in the hope that it will be useful,           //
// but WITHOUT ANY WARRANTY; without even the implied warranty of            //
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the             //
// GNU General Public License for more details.                              //
//                                                                           //
///////////////////////////////////////////////////////////////////////////////

// Controllers
var mongoose = require('mongoose')
    , passport = require('passport');

// Load model
var account_schema = require('../models/account')
  , Account = mongoose.model('Account', account_schema);


///////////////////////////////////////////////////////////////////////////////
// Route to Account signin                                                   //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON Account                                             //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /account/signin                                                  //
///////////////////////////////////////////////////////////////////////////////
exports.signIn = function(request, response, next) {

    response.contentType('application/json');
    passport.authenticate('local', function(error, user, info) {
        if (error) {
            return next(error);
        }
        if (!user) {
            console.log("unauthorized");
            var nouserJSON = JSON.stringify({title: 'bad login', locale: 'en_US', message: 'invalid username'});
            return response.send(nouserJSON);
        }
        request.logIn(user, function(error) {
            if (error) {
                return next(error);
            }
        });
        console.log("auth okay");
        var accountJSON = JSON.stringify(request.user);
        return response.send(accountJSON);
    })(request, response, next);
};

///////////////////////////////////////////////////////////////////////////////
// Route to get specific Account by its _id                                  //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON Account                                             //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /account/getAccountById/:id                                      //
///////////////////////////////////////////////////////////////////////////////
exports.getAccountById = function(request, response, next) {

    response.contentType('application/json');
    Account.findById(request.params.id, gotAccount);

    function gotAccount(error, account) {
        if (error) {
            return next(error);
        }
        var accountJSON = JSON.stringify(account);
        return response.send(accountJSON);
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to get currently authenticated Account                              //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON authenticated account                               //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /account/getAccount                                              //
///////////////////////////////////////////////////////////////////////////////
exports.getAccount = function(request, response, next) {
    response.contentType('application/json');
    if(request.isAuthenticated()) {
        var account = JSON.stringify(request.user);
        return response.send(account);
    }
    var message = JSON.stringify({error: 'youre not logged in'});
    return response.send(message);
};

///////////////////////////////////////////////////////////////////////////////
// Route to create a new Account                                             //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON newly created account                               //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /account/createAccount                                           //
///////////////////////////////////////////////////////////////////////////////
exports.createAccount = function(request, response, next) {

    response.contentType('application/json');
    var username = request.body.username;
    console.log("registering: user: %s pass: %s", request.body.username, request.body.password);

    Account.findOne({username : username}, function(error, existingUser) {
        if (error || existingUser) {
            console.log("existingUser");
            var message = JSON.stringify({error: "existingUser", message: 'User already exists'});
            return response.send(message);
        }
        var account = new Account({ username : request.body.username, email: request.body.username});
        account.setPassword(request.body.password, function(error) {
            if (error) {
                return response.render('signup', { account : account });
            }
            account.save(function(error) {
                if (error) {
                    var message = JSON.stringify({error: "faultSave", message: 'Cannot save user'});
                    return response.send(message);
                }
                var message = JSON.stringify(account);
                return response.send(message);
            });
        });
    });
};

///////////////////////////////////////////////////////////////////////////////
// Route to update an Account                                                //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON updated account                                     //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url POST /account/update/:id                                             //
///////////////////////////////////////////////////////////////////////////////
exports.update = function (request, response, next) {

    response.contentType('application/json');
    Account.findByIdAndUpdate({username : request.body.username}, request.body, updateAccount);

    function updateAccount (error, account) {
        if (error) {
            console.log(error);
            return next(error);
        }
        if (!account) {
            console.log(error);
            return next(error);
        }
        else {
            console.log(JSON.stringify(account));
        }
        var accountJSON = JSON.stringify(account);
        return response.send(accountJSON);
    }
};

