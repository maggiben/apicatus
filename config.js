///////////////////////////////////////////////////////////////////////////////
// Primary configuration file                                                //
///////////////////////////////////////////////////////////////////////////////
var os = require("os");

///////////////////////////////////////////////////////////////////////////////
// Development options                                                       //
///////////////////////////////////////////////////////////////////////////////
var development = {
    sessionSecret: "secret",
    environment: process.env.NODE_ENV,
    listenPort: process.env.PORT || 8080,
    ip: process.env.IP || os.hostname(),
    allowCrossDomain: false,
    autoStart: true,
    mongoUrl: {
        hostname: "paulo.mongohq.com",
        port: 10026,
        username: "admin",
        password: "admin",
        name: "",
        db: "apicatus"
    }
};
///////////////////////////////////////////////////////////////////////////////
// Testing options                                                           //
// Warning: DB must be empty, do not use dev or prod databases               //
///////////////////////////////////////////////////////////////////////////////
var test = {
    sessionSecret: "secret",
    environment: process.env.NODE_ENV,
    listenPort: process.env.PORT || 8080,
    ip: process.env.IP || os.hostname(),
    allowCrossDomain: false,
    autoStart: false,
    mongoUrl: {
        hostname: "paulo.mongohq.com",
        port: 10026,
        username: "admin",
        password: "admin",
        name: "",
        db: "apicatus"
    }
};
///////////////////////////////////////////////////////////////////////////////
// Production options                                                        //
///////////////////////////////////////////////////////////////////////////////
var production = {
    sessionSecret: "secret",
    environment: process.env.NODE_ENV,
    listenPort: process.env.PORT || 8080,
    ip: process.env.IP || os.hostname(),
    allowCrossDomain: false,
    autoStart: true,
    mongoUrl: {
        hostname: "paulo.mongohq.com",
        port: 10026,
        username: "admin",
        password: "admin",
        name: "",
        db: "apicatus"
    }
};

module.exports = (function(){
    switch(process.env.NODE_ENV){
        case 'development':
            return development;
        case 'test':
            return test;
        case 'production':
            return production;
        default:
            return development;
    }
})();