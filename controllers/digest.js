var express = require('express'),
    conf = require('../config'),
    AccountMdl = require('../models/account'),
    AccountCtl = require('../controllers/account'),
    DigestorMdl = require('../models/digestor')
    DigestorCtl = require('../controllers/digestor'),
    FileSystem = require('fs'),
    util = require('util'),
    vm = require('vm'),
    url = require('url'),
    SocketIo = require('socket.io');
///////////////////////////////////////////////////////////////////////////////
// APICATUS Digestors logic                                                  //
///////////////////////////////////////////////////////////////////////////////
exports.digestRequest = function(request, response, next) {
    console.log("digest")
    return next();
    /*
    if (!request.headers.host) {
        return next();
    }
    var host = request.headers.host.split(':')[0];
    var subdomain = host.split( "." )[ 0 ];
    var path = subdomain;
    var filename = "./digestors/deedee.js";
    var url_parts = url.parse(request.url, true);
    var query = url_parts.query;

    //console.log("url: " + request.url + " subdomain: " + subdomain + " url_parts: " + JSON.stringify(url_parts) + " query: " + JSON.stringify(query));

    DigestorMdl.findOne({name: subdomain}, gotDigestor);
    function gotDigestor(error, digestor) {
        if (error) {
            return next(error);
        }
        if(!digestor) {
            return next();
        }
        var sandbox = {
            test: [],
            "__dirname": __dirname,
            require: require,
            FileSystem: FileSystem,
            console: console,
            exports: exports,
            api: digestor,
        }
        FileSystem.readFile(filename, 'utf8', function(error, data) {
            if (error) {
                return next(error);
            }
            var ctx = vm.createContext(sandbox);
            var script = vm.createScript(data);
            script.runInContext(ctx);
            var result = ctx.processResource(request, response, next);
            //console.log(ctx);
            for(var i = 0; i < ctx.api.entries.length; i += 1) {
                console.log(ctx.api.entries[i].hits);
                //digestor.entries[2].hits = 22;
                extend(digestor.entries[i], ctx.api.entries[i]);
            }

            digestor.save(onSaved);

            function onSaved(error, data) {
                if (error) {
                    console.log(error);
                    return next(error);
                }
                console.log("digestor saved");
                //console.log(data)
            }
            return result;
        });
    }
    */
}