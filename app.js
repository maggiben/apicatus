///////////////////////////////////////////////////////////////////////////////
// Module dependencies.                                                      //
///////////////////////////////////////////////////////////////////////////////
var express = require('express'),
    mongoose = require('mongoose'),
    conf = require('./config'),
    Account = require('./models/account'),
    Account_controller = require('./controllers/account'),
    DigestorMdl = require('./models/digestor')
    DigestorCtl = require('./controllers/digestor'),
    passport = require('passport'),
    FileSystem = require('fs'),
    util = require('util'),
    vm = require('vm'),
    url = require('url'),
    LocalStrategy = require('passport-local').Strategy;

///////////////////////////////////////////////////////////////////////////////
// Mongo setup middleware                                                    //
///////////////////////////////////////////////////////////////////////////////
if(process.env.VCAP_SERVICES){
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
}
else{
    var mongo = {
        "hostname": "127.0.0.1",
        "port": 27017,
        "username": "admin",
        "password": "admin",
        "name": "",
        "db": "fans"
    };
}
var generate_mongo_url = function(obj){
    obj.hostname = (obj.hostname || 'localhost');
    obj.port = (obj.port || 27017);
    obj.db = (obj.db || 'test');
    if(obj.username && obj.password){
        return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
    else{
        return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
    }
};
var mongourl = generate_mongo_url(conf.mongo_local);
console.log("mongourl: " + mongourl)

////////////////////////////////////////////////////////////////////////////
// Extend an object with another object's properties.                     //
////////////////////////////////////////////////////////////////////////////
function extend(object) {
    // Takes an unlimited number of extenders.
    var args = Array.prototype.slice.call(arguments, 1);

    // For each extender, copy their properties on our object.
    for (var i = 0, source; source = args[i]; i++) {
        if (!source) continue;
        for (var property in source) {
            object[property] = source[property];
        }
    }
    return object;
}
///////////////////////////////////////////////////////////////////////////////
// Run app                                                                   //
///////////////////////////////////////////////////////////////////////////////
var app = express();

var statics = function(request, response, next) {
    var start = new Date;

    if (response._responseTime) return next();
    response._responseTime = true;


    request.on('end', function() {
        //console.log('end');
    });
    response.on('header', function(){
      var duration = new Date - start;
      response.setHeader('X-Response-Time', duration + 'ms');
        //console.log(response.getHeader('Content-Length'));
        console.log('X-Response-Time: ' + duration + 'ms');
    });
    next();
}


var extend = function(object) {
    // Takes an unlimited number of extenders.
    var args = Array.prototype.slice.call(arguments, 1);

    // For each extender, copy their properties on our object.
    for (var i = 0, source; source = args[i]; i++) {
        if (!source) continue;
        for (var property in source) {
            object[property] = source[property];
        }
    }
    return object;
}

///////////////////////////////////////////////////////////////////////////////
// CORS middleware (only to test on cloud9)                                  //
///////////////////////////////////////////////////////////////////////////////
var allowCrossDomain = function(request, response, next) {
    response.header('Access-Control-Allow-Origin', '*');
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, X-Level3-Digest-Time, Content-Type, Authorization, Accept");
    response.header('Access-Control-Allow-Methods', 'OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT');

    // intercept OPTIONS method
    if ('OPTIONS' == request.method) {
        response.send(200);
    }
    else {
        next();
    }
};

// reusable middleware to test authenticated sessions
function ensureAuthenticated(request, response, next) {
    console.log(ensureAuthenticated);
    if(request.isAuthenticated()) {
        return next();
    }
    response.contentType('application/json');
    response.status(403);
    response.send({error: 'unauthorized'}); // if failed...
    //response.redirect('/signin'); // if failed...
}
function digestRequest(request, response, next) {
    if (!request.headers.host) {
        return next();
    }
    var host = request.headers.host.split(':')[0];
    var subdomain = host.split( "." )[ 0 ];
    var path = subdomain;
    var filename = "./digestors/" + subdomain + ".js";
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
}
///////////////////////////////////////////////////////////////////////////////
// Configuration                                                             //
///////////////////////////////////////////////////////////////////////////////
app.configure(function(){
    app.set('view engine', 'html');
    app.set('views', __dirname + '/views');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(statics);
    app.use(express.session({ secret: conf.sessionSecret }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(allowCrossDomain);
    app.use(app.router);
    app.use(digestRequest);
    //app.use(express.vhost('*.miapi.com', require('./test/test').test));
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function() {
  app.use(express.errorHandler());
});


///////////////////////////////////////////////////////////////////////////////
// passport setup & strategy                                                 //
///////////////////////////////////////////////////////////////////////////////
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());
// Connect mongoose
mongoose.connect(mongourl);
// Check if connected
mongoose.connection.on("open", function(){
    console.log("mongodb connected at: %s", mongourl);
});

///////////////////////////////////////////////////////////////////////////////
// Digestors Resource Management                                             //
///////////////////////////////////////////////////////////////////////////////
// Collections CURD
app.post('/digestors', DigestorCtl.create);
app.put('/digestors/:id', DigestorCtl.update);
/*
app.put('/digestors', function(request, response, next) {
    response.contentType('application/json');
    console.log(request.body);
    response.status(403);
    response.send(request.body);
});
*/
app.get('/digestors', DigestorCtl.getAll);
app.get('/digestors/:id', DigestorCtl.getById);
//app.delete('/digestors', DigestorCtl.removeAll);
// Elements
//app.get('/digestors/:id', DigestorCtl.getById);
//app.put('/digestors/:id', DigestorCtl.update);
//app.delete('/digestors/:id', DigestorCtl.remove);
///////////////////////////////////////////////////////////////////////////////
// Application rutes                                                         //
///////////////////////////////////////////////////////////////////////////////
app.get('/', function(request, response) {
    response.sendfile(__dirname + '/public/miapi.html');
});

app.get('/apis/:id', function(request, response, next) {
    response.contentType('application/json');
    var mock = {
        "name": "MyApi",
        "_version": "0.1",
        "domain": "test",
        "baseurl": "/MyApi",
        "logging": "fase",
        "allowCrossDomain": true,
        "resourceGroups": [
            {
                "name": "Shopping Cart Resource group",
                "description": "",
                "resources": [
                    {
                        "name": "Shopping Cart Resources",
                        "description": "The following is a section of resources related to the shopping cart",
                        "uriTemplate": "/messages/{id}",
                        "model": {},
                        "parameters": {},
                        "headers": {},
                        "actions": [
                            {
                                "name": "Retrieve Message",
                                "description": "Retrieve a message by its *id*.\n\n",
                                "method": "GET",
                                "parameters": {},
                                "headers": {},
                                "examples": [
                                    {
                                        "name": "",
                                        "description": "",
                                        "requests": [],
                                        "responses": [
                                            {
                                                "name": "200",
                                                "description": "",
                                                "headers": {
                                                    "Content-Type": {
                                                        "value": "text/plain"
                                                    }
                                                },
                                                "body": "Hello World!\n",
                                                "schema": ""
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "name": "Delete Message",
                                "description": "Delete a message. **Warning:** This action **permanently** removes the message from the database.\n\n",
                                "method": "DELETE",
                                "parameters": {},
                                "headers": {},
                                "examples": [
                                    {
                                        "name": "",
                                        "description": "",
                                        "requests": [],
                                        "responses": [
                                            {
                                                "name": "204",
                                                "description": "",
                                                "headers": {},
                                                "body": "",
                                                "schema": ""
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        "entries": [
            {
                "id": "z1",
                "route": "/test",
                "method": {"id": 1, "label": "OPTIONS"},
                "parameters": {
                    headers: ["Required Parameters", "Description", "Version"],
                    values: [
                        ["api_key", "Api session key", "1.0"],
                        ["request_token", "The request token parameter is the token you generated for the user to approve.", "1.0"]
                    ]
                },
                "sends": "/data/test.json",
                "status": { "id": 403 },
                "contentType": "application/json",
                "description": "This method is used to generate a valid request token for user based authentication. A request token is required in order to request a session id. You can generate any number of request tokens but they will expire after 60 minutes. As soon as a valid session id has been created the token will be destroyed.",
                "proxy": {
                    "enabled": true,
                    "url": "http://google.com"
                }
            },
            {
                "id": "z2",
                "route": "/test2",
                "method": {"id": 2, "label": "GET"},
                "parameters": {
                    headers: ["Required Parameters", "Description", "Version"],
                    values: [
                        ["api_key", "Api session key", "1.0"],
                        ["request_token", "The request token parameter is the token you generated for the user to approve.", "1.0"]
                    ]
                },
                "sends": "/data/test.json",
                "status": { "id": 204 },
                "contentType": "application/json",
                "description": "stuff",
                "proxy": {
                    "enabled": false,
                    "url": "http://yahoo.com"
                }
            },
        ]
    };

    var retJSON = JSON.stringify(mock);
    return response.send(retJSON);
})

app.put('/apis/:id', function(request, response, next) {
    response.contentType('application/json');
    console.log(request.body);
    FileSystem.writeFile("./data/apicatus.json", JSON.stringify(request.body, null, 4), function(error) {
        if(error) {
            return next(error);
        } else {
            console.log("JSON saved to ");
        }
    });
    response.status(403);
    response.send(request.body);
});
///////////////////////////////////////////////////////////////////////////////

app.get('/views/:name', function(request, response) {
    response.sendfile(__dirname + '/views/' + request.params.name);
});
///////////////////////////////////////////////////////////////////////////////
// MOCKS API                                                                 //
///////////////////////////////////////////////////////////////////////////////
/*
app.get('/:userid/*', ensureAuthenticated, function(request, response, next) {
    response.contentType('application/json');
    response.status(200);
    response.sendfile(__dirname + '/request.json');
});
*/
app.get('/clients',  function(request, response, next) {
    response.contentType('application/json');
    var mock = {"clients":[{"created_at":"2012-12-18T04:50:25Z","urls":{"self":"https://secure.gaug.es/clients/5ddfdb50358f68fa55670adbc3d86ea2"},"description":"popopo","key":"5ddfdb50358f68fa55670adbc3d86ea2"}]}
    var retJSON = JSON.stringify(mock);
    return response.send(retJSON);
});
///////////////////////////////////////////////////////////////////////////////
// USER API                                                                  //
// @signup
// @signin
// @signout
// @forgot
// @password                                                                 //
///////////////////////////////////////////////////////////////////////////////
app.post('/signup', function(req, res) {

        var username = req.body.username;
        console.log("registering: user: %s pass: %s", req.body.username, req.body.password);

        Account.findOne({username : username }, function(err, existingUser) {
            if (err || existingUser) {
                console.log("existingUser");
                return res.render('signup', { account : account });
            }
            var account = new Account({ username : req.body.username, email: req.body.username});
            account.setPassword(req.body.password, function(err) {
                if (err) {
                    return res.render('signup', { account : account });
                }
                account.save(function(err) {
                    if (err) {
                        return res.render('signup', { account : account });
                    }
                    return res.redirect('/');
                });
            });
        });
});
app.post('/signin', function(request, response, next) {
    response.contentType('application/json');
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            console.log("unauthorized");
            response.status(403);
            return response.send({error: 'unauthorized'});
            //return response.render('signin', { title: 'bad login', locale: 'en_US', user: req.user });
        }
        request.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
        });
        console.log("auth okay");

        return response.send(user);
        // redirect but pass route to client application
        return res.redirect('/');
    })(request, response, next);
});
app.get('/signout', function(request, response, next) {
    request.logout();
    response.status(200);
    return response.send({success: 'signout'});
});
app.post('/forgot', function(req, res) {

    var email = req.body.email;
    //res.writeHead(401, {"Content-Type": "application/json"});
    res.contentType('application/json');

    Account.findOne({email : email }, function(err, existingUser) {
            if (err) {
                res.statusCode = 401;
                var retJSON = JSON.stringify({"message":"Error","status":"fail"});
                return res.send(retJSON);
            }
            else if (existingUser) {
                var retJSON = JSON.stringify({"message":"Error","status":"fail"});
                return res.send(retJSON);
            }
            else {
                // Invalid login/password
                //res.writeHead(401, {"Content-Type": "application/json"});
                //res.end(JSON.stringify({error:{type:"Unauthorized",message:"Wrong username and/or password.", code:"401"}}));
                res.statusCode = 401;
                var retJSON = JSON.stringify({"message":"Error","status":"Wrong username and/or password."});
                return res.send(retJSON);
            }
    });
});
///////////////////////////////////////////////////////////////////////////////
// TEST API                                                                  //
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// socket.io                                                                 //
///////////////////////////////////////////////////////////////////////////////
var server = require('http').createServer(app)
var io = require('socket.io').listen(server);

server.listen(conf.listenPort);

///////////////////////////////////////////////////////////////////////////////
// socket.io event listeners                                                 //
///////////////////////////////////////////////////////////////////////////////
io.sockets.on('connection', function (socket) {

    io.sockets.emit('this', { will: 'be received by everyone'});

    socket.on('message', function (message) {
        console.log("Got message: " + message);
        ip = socket.handshake.address.address;
        url = message;
        io.sockets.emit('news', { 'connections': Object.keys(io.connected).length, 'ip': '***.***.***.' + ip.substring(ip.lastIndexOf('.') + 1), 'url': url, 'xdomain': socket.handshake.xdomain, 'timestamp': new Date()});
    });
    socket.on('my other event', function (data) {
        console.log('my other event' + data);
    });
    socket.on('consoleio', function (data) {
        console.log('consoleio' + JSON.stringify(data));
        data.message = data.message || {};
        switch(data.message)
        {
            case 'exec':

                var spawn = require('child_process').spawn;
                var exec = spawn(data.command, data.arguments); //spawn(data.command, data.arguments);
                exec.stdout.setEncoding('ascii');
                exec.stderr.setEncoding('ascii');

                exec.stdout.on('data', function (data) {
                  console.log('stdout: ' + data);
                  io.sockets.emit('consoleio', { message: 'exec', io: 'stdout', command: data.command, result: data });
                });

                exec.stderr.on('data', function (data) {
                    console.log('stderr: ' + data);
                    io.sockets.emit('consoleio', { message: 'exec', io: 'stderr', command: data.command, result: data });
                });

                exec.on('exit', function (code) {
                    console.log('child process exited with code ' + code);
                    io.sockets.emit('consoleio', { message: 'exec', command: data.command, result: 'exit' });
                });
                break;

        }
        io.sockets.emit('consoleio', { event: 'message received', data: data});
    });
    socket.on('disconnect', function () {
        console.log("Socket disconnected");
        io.sockets.emit('pageview', { 'connections': Object.keys(io.connected).length });
    });
});
