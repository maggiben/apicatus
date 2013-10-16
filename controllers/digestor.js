///////////////////////////////////////////////////////////////////////////////
// @file         : digestor.js                                               //
// @summary      : Digestor controller                                       //
// @version      : 0.1                                                       //
// @project      : mia.pi                                                    //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 6 Oct 2013                                                //
// ------------------------------------------------------------------------- //
//                                                                           //
// @copyright Copyright 2013 Benjamin Maggi, all rights reserved.            //
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
var mongoose = require('mongoose');

// Load model
var digestor_schema = require('../models/digestor')
  , Digestor = mongoose.model('Digestor', digestor_schema);

///////////////////////////////////////////////////////////////////////////////
// Route to get all Digestors                                                //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON Collection of Digestors                             //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /digestor/getall                                                 //
///////////////////////////////////////////////////////////////////////////////
exports.getAll = function (request, response, next) {

    response.contentType('application/json');
    Digestor.find(gotDigestors);

    function gotDigestors(err, digestors) {
        if (err) {
            console.log(err);
            return next();
        }
        var digestorsJSON = JSON.stringify(digestors);
        return response.send(digestorsJSON);
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to a specific Digestor                                              //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON Digestor                                            //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /digestor/getbyid                                                //
///////////////////////////////////////////////////////////////////////////////
exports.getById = function (request, response, next) {

    response.contentType('application/json');
    Digestor.findById(request.params.id, gotDigestor);

    function gotDigestor(err, digestor) {
        if (err) {
            return next(err);
        }
        if(!digestor) {
            response.statusCode = 404;
            errJSON = JSON.stringify({"title": "error", "message":"Not Found","status":"fail"});
            return response.send(errJSON);
        }
        var digestorJSON = JSON.stringify(digestor);
        return response.send(digestorJSON);
    }
};

exports.getDigestorByName = function (name, callback) {

    Digestor.findOne({name: name}, gotDigestor);
    function gotDigestor(error, digestor) {
        if (error) {
            return error;
        }
        if(!digestor) {
            return new Error("Not found");
        }
        console.log("getDigestorByName: " + digestor._id);
        return digestor;
        //return callback(digestor);
    }
};
///////////////////////////////////////////////////////////////////////////////
// Route to add a Digestor                                                   //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON result                                              //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /digestor/create                                                 //
///////////////////////////////////////////////////////////////////////////////
exports.create = function (request, response, next) {

    var digestor = new Digestor({
        name: request.body.name,
        created: new Date(),
        lastUpdate: new Date(),
        lastAccess: new Date(),
        entries: request.body.entries || []
    });

    response.contentType('application/json');
    digestor.save(onSaved);

    function onSaved(err, digestor) {
        if (err) {
            console.log(err);
            return next(err);
        }
        response.status(201);
        return response.send(JSON.stringify(digestor));
    }
};

exports.test = function (request, response, next) {
    response.contentType('application/json');
    console.log(request.body);
    response.status(403);
    response.send(request.body);
};
///////////////////////////////////////////////////////////////////////////////
// Route to update a Digestor                                                //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON updated document                                    //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url PUT /digestors/:id                                                   //
///////////////////////////////////////////////////////////////////////////////
exports.update = function (request, response, next) {

    response.contentType('application/json');
    Digestor.findById(request.params.id, updateDigestor);

    function updateDigestor (error, digestor) {
        if (error) {
            console.log(error);
            return next(error);
        }
        if (!digestor) {
            console.log(error);
            return next(error);
        }
        else {
            // is Ok
        }
        digestor.name = request.body.name || digestor.name;
        digestor.entries = request.body.entries || digestor.entries;
        digestor.lastUpdate = new Date();
        digestor.lastAccess = new Date();

        digestor.save(onSaved);

        function onSaved(error, digestor) {
            if (error) {
                console.log(error);
                return next(error);
            }
            var digestorJSON = JSON.stringify(digestor);
            return response.send(digestorJSON);
        }
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to remove a Digestor                                                //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON result                                              //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /digestor/remove/:id                                             //
///////////////////////////////////////////////////////////////////////////////
exports.remove = function (request, response, next) {
    response.contentType('application/json');
    Digestor.remove({_id: request.params.id}, delDigestor);

    function delDigestor(error, digestor) {
        if (error) {
            return next(error);
        }
        var msgJSON = JSON.stringify({action: 'remove', result: 0});
        return response.send(msgJSON);
    }
};

///////////////////////////////////////////////////////////////////////////////
// Route to remove all Digestors                                             //
//                                                                           //
// @param {Object} request                                                   //
// @param {Object} response                                                  //
// @param {Object} next                                                      //
// @return {Object} JSON result                                              //
//                                                                           //
// @api public                                                               //
//                                                                           //
// @url GET /digestor/removeall                                              //
///////////////////////////////////////////////////////////////////////////////
exports.removeAll = function (request, response, next) {

    response.contentType('application/json');
    Digestor.find(gotDigestors);

    function gotDigestors(error, digestors) {
        if (error) {
            console.log(error)
            return next();
        }
        if (!digestors || !Array.isArray(digestors) || digestors.length === 0)
        {
            console.log('no docs found');
            return next();
        }
        digestors.forEach(function (digestor) {
            digestor.remove(function (err, product) {
                console.log('document id:%d could not be removed', digestor._id);
                return next();
            });
        });
        var msgJSON = JSON.stringify({action: 'removeAll', result: true});
        return response.send(msgJSON);
    }
};

