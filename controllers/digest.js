var express = require('express'),
    conf = require('../config'),
    AccountMdl = require('../models/account'),
    AccountCtl = require('../controllers/account'),
    DigestorMdl = require('../models/digestor')
    DigestorCtl = require('../controllers/digestor'),
    LogsCtl = require('../controllers/logs'),
    FileSystem = require('fs'),
    util = require('util'),
    vm = require('vm'),
    url = require('url'),
    SocketIo = require('socket.io'),
    http = require('http'),
    httpProxy = require('http-proxy');


// var proxy = httpProxy.RoutingProxy();
///////////////////////////////////////////////////////////////////////////////
// APICATUS Digestors logic                                                  //
///////////////////////////////////////////////////////////////////////////////
function _escapeRegExp(str) {
    return str.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}


/**
 * Creates the custom regex object from the specified baseUrl
 *
 * @param  {string} baseUrl [description]
 * @return {Object} the regex object
 */
function subdomainRegex(baseUrl){
    var regex;

    baseUrl = _escapeRegExp(baseUrl);

    regex = new RegExp('((?!www)\\b[-\\w\\.]+)\\.' + baseUrl + '(?::)?(?:\d+)?');

    return regex;
}
exports.digestRequest = function(request, response, next) {
    console.log("digest")
    //return next();

    if (!request.headers.host) {
        console.log("skip digest");
        return next();
    }
    // original req.url
    var originalUrl = request.headers.host + request.url;

    // create our subdomain regex
    var regex = subdomainRegex("miapi.com");

    // extract the subdomain string from the req.url
    var subdomainString = regex.exec(request.headers.host);

    //console.log("subdomainString", subdomainString);

    // if there is no subdomain, return
    if(!subdomainString) return next();

    // create an array of subdomains
    subdomainArray = subdomainString[1].split('.');

    console.log("subdomainArray", subdomainArray);


    var host = request.headers.host.split(':')[0];
    var subdomain = host.split( "." )[ 0 ];
    var path = subdomain;
    var filename = "./digestors/deedee.js";
    var url_parts = url.parse(request.url, true);
    var query = url_parts.query;

    console.log("query: ", request.url," subdomain: " , subdomain , " body: ", request.body, " method: ", request.method);

    var proxyRequest = function(request, response, cb) {
        LogsCtl.create(request, response, next);
        var options = {
            host: 'google.com',
            port: 80,
            path: request.url,
            method: 'GET',
            path: '/',
            headers: {}
        };
        var req = http.request(options, function(response) {
            console.log('STATUS: ' + response.statusCode);
            console.log('HEADERS: ' + JSON.stringify(response.headers));
            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                console.log('BODY: ' + chunk);
                cb(chunk);
            });
        });
        req.on('error', function(error) {
            console.log('problem with request: ' + error.message);
        });
        // write data to request body
        req.write(JSON.stringify(request.body));
        req.end();
    };
    var gotDigestor = function(error, digestor) {
        if (error) {
            response.status(500);
            return next(error);
        }
        if(!digestor) {
            response.status(404);
            return response.json({ error: "digestor not found" });
        }

        /*var sandbox = {
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
        }*/
        console.log("found digestor for subdomain !");
        proxyRequest(request, response, function(data){
            response.status(200);
            return response.send(data);
        });
    };

    DigestorMdl.findOne({name: subdomainArray[0]}, gotDigestor);

    /*
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