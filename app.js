///////////////////////////////////////////////////////////////////////////////
// Module dependencies.                                                      //
///////////////////////////////////////////////////////////////////////////////
var express = require('express'),
    mongoose = require('mongoose'),
    conf = require('./config'),
    AccountMdl = require('./models/account'),
    AccountCtl = require('./controllers/account'),
    DigestorMdl = require('./models/digestor')
    DigestorCtl = require('./controllers/digestor'),
    FileSystem = require('fs'),
    util = require('util'),
    vm = require('vm'),
    url = require('url'),
    SocketIo = require('socket.io'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy;

///////////////////////////////////////////////////////////////////////////////
// Mongo setup middleware                                                    //
///////////////////////////////////////////////////////////////////////////////
if(process.env.VCAP_SERVICES){
    var env = JSON.parse(process.env.VCAP_SERVICES);
    var mongo = env['mongodb-1.8'][0]['credentials'];
} else {
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

var init = function(options) {
    if(conf.autoStart) {
        console.log("autostarting app")
        var mongoUrl = generate_mongo_url(conf.mongoUrl);
        console.log("mongodb connet to", mongoUrl);
        ///////////////////////////////////////////////////////////////////////////
        // MongoDB Connection setup                                              //
        ///////////////////////////////////////////////////////////////////////////
        // Connect mongoose
        mongoose.connect(mongoUrl);
        //mongoose.connect('mongodb://admin:admin@alex.mongohq.com:10062/cloud-db');
        // Check if connected
        mongoose.connection.on("open", function(){
            console.log("mongodb connected to: %s", mongoUrl);
        });
        var server = require('http').createServer(app)
        var io = require('socket.io').listen(server);
        server.listen(conf.listenPort);
    }
}


///////////////////////////////////////////////////////////////////////////////
// Extend an object with another object's properties.                        //
///////////////////////////////////////////////////////////////////////////////
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
    //console.log("ensureAuthenticated");
    //console.log(request.isAuthenticated());
    if(request.isAuthenticated()) {
        return next();
    }
    response.contentType('application/json');
    response.status(403);
    response.send({error: 'unauthorized'}); // if failed...
    //response.redirect('/signin'); // if failed...
}

///////////////////////////////////////////////////////////////////////////////
// APICATUS Digestors logic                                                  //
///////////////////////////////////////////////////////////////////////////////
function digestRequest(request, response, next) {
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
    app.use(express.session({ secret: conf.sessionSecret }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(allowCrossDomain);
    app.use(app.router);
    //app.use(digestRequest);
    //app.use(express.vhost('*.miapi.com', require('./test/test').test));
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    app.use(express.logger());
});
app.configure('testing', function() {
    app.use(express.errorHandler());
});
app.configure('production', function() {
    app.use(express.errorHandler());
});



///////////////////////////////////////////////////////////////////////////////
// passport setup & strategy                                                 //
///////////////////////////////////////////////////////////////////////////////
//passport.use(new LocalStrategy(Account.authenticate()));
passport.use(AccountMdl.createStrategy());
passport.serializeUser(AccountMdl.serializeUser());
passport.deserializeUser(AccountMdl.deserializeUser());

///////////////////////////////////////////////////////////////////////////////
// Digestors Resource Management                                             //
///////////////////////////////////////////////////////////////////////////////
// Collections
app.post('/digestors', DigestorCtl.create);
app.get('/digestors', ensureAuthenticated, DigestorCtl.readAll);
//app.put('/digestors', DigestorCtl.updateAll);
app.delete('/digestors', DigestorCtl.deleteAll);
// Entities
app.get('/digestors/:name', DigestorCtl.readOne);
app.put('/digestors/:name', DigestorCtl.updateOne);
app.delete('/digestors/:name', DigestorCtl.deleteOne);

/*
app.put('/digestors/:id', DigestorCtl.updateOne);
app.get('/digestors', DigestorCtl.getOne);
app.get('/digestors/:id', DigestorCtl.getById);
*/

//app.delete('/digestors', DigestorCtl.removeAll);
// Elements
//app.get('/digestors/:id', DigestorCtl.getById);
//app.put('/digestors/:id', DigestorCtl.update);
//app.delete('/digestors/:id', DigestorCtl.remove);
///////////////////////////////////////////////////////////////////////////////
// Application rutes                                                         //
///////////////////////////////////////////////////////////////////////////////
app.get('/', function(request, response) {
    response.sendfile(__dirname + '/public/index.html');
});

///////////////////////////////////////////////////////////////////////////////
// User CRUD Methods & Servi                                                 //
///////////////////////////////////////////////////////////////////////////////
app.post('/user/signin', AccountCtl.signIn);
app.get('/user/signout', function(request, response, next) {
    response.contentType('application/json');
    request.logout();
    response.status(204);
    var message = JSON.stringify({});
    return response.send(message);
});
app.post('/user/forgot', function(req, res) {

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
app.post('/user', AccountCtl.create);
app.get('/user', ensureAuthenticated, AccountCtl.read);
app.put('/user', ensureAuthenticated, AccountCtl.update);
app.del('/user', ensureAuthenticated, AccountCtl.delete);

app.post('/xxx', ensureAuthenticated, function(request, response, next) {
    console.log("no prob")
    response.contentType('application/json');
    response.status(401);
    var message = JSON.stringify({message: 'xxx'});
    return response.send(message);
});

///////////////////////////////////////////////////////////////////////////////
// socket.io                                                                 //
///////////////////////////////////////////////////////////////////////////////

init();
exports.app = app;
//module.exports = app;

///////////////////////////////////////////////////////////////////////////////
// socket.io event listeners                                                 //
///////////////////////////////////////////////////////////////////////////////
var socketIoHandler = function(io) {
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
}
