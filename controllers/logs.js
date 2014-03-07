///////////////////////////////////////////////////////////////////////////////
// @file         : logger.js                                                 //
// @summary      : Logger controller                                         //
// @version      : 0.1                                                       //
// @project      : apicat.us                                                 //
// @description  :                                                           //
// @author       : Benjamin Maggi                                            //
// @email        : benjaminmaggi@gmail.com                                   //
// @date         : 5 Mar 2014                                                //
// ------------------------------------------------------------------------- //
//                                                                           //
// @copyright Copyright 2013~2014 Benjamin Maggi, all rights reserved.       //
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
    , url = require('url');

// Load model
var logs_schema = require('../models/logs')
  , Logs = mongoose.model('Logs', logs_schema)
  , digestor_schema = require('../models/digestor')
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
// @url GET /logs/                                                           //
///////////////////////////////////////////////////////////////////////////////
exports.read = function (request, response, next) {
    Logs.find(gotLogs).limit(10);

    function gotLoggers(error, logs) {
        if (error) {
            return next();
        }
        if(!logs) {
            response.statusCode = 404;
            return response.json({"title": "error", "message": "Not Found", "status": "fail"});
        }
        return response.json(logs);
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
// @url GET /logs/:id                                                        //
///////////////////////////////////////////////////////////////////////////////
exports.findBy = function (request, response, next) {
    Logger.findOne({_id: request.params._id}, gotLog);

    function onRead(error, log) {
        if (error) {
            return next(error);
        }
        if(!log) {
            response.statusCode = 404;
            return response.json({"title": "error", "message": "Not Found", "status": "fail"});
        }
        return response.json(log);
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
// @url POST /logs                                                           //
///////////////////////////////////////////////////////////////////////////////
exports.create = function (request, response, next) {

    var ip = request.headers['x-forwarded-for'] ||
        request.connection.remoteAddress ||
        request.socket.remoteAddress ||
        request.connection.socket.remoteAddress;

    var url_parts = url.parse(request.url, true);
    var query = url_parts.query;

    var log = new Logs({
        ip: ip,
        query: query,
        requestHeaders: request.headers,
        requestBody: request.body,
        responseHeaders: {},
        responseBody: {},
        status: 0,
        timeStamp: new Date(),
        time: 0
    });

    log.save(onSave);

    function onSave(error, log) {
        if (error) {
            return next(error);
        }
        if(!log) {
            response.statusCode = 500;
            return response.json({"title": "error", "message": "could not save", "status": "fail"});
        }
        response.statusCode = 201;
        return response.json(log);
    }
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
// @url PUT /logs/:id                                                        //
///////////////////////////////////////////////////////////////////////////////
exports.update = function (request, response, next) {

    Logs.findOneAndUpdate({_id: request.params._id}, request.body, onUpdate);

    function onUpdate (error, log) {
        if (error) {
            return next(error);
        }
        if (!account) {
            return next(error);
        }
        response.status(200);
        return response.json(log);
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
// @url DELETE /logs/:id                                                     //
///////////////////////////////////////////////////////////////////////////////
exports.delete = function (request, response, next) {
    if(request.params._id) {
        Logs.findOneAndRemove({_id: request.params._id}, onDelete);
    } else {
        // remove all
        Logs.find().remove(onDelete);
    }
    function onDelete(error) {
        if (error) {
            return next(error);
        }
        response.statusCode = 204;
        return response.json({action: 'delete', result: true});
    }
};


