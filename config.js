///////////////////////////////////////////////////////////////////////////////
// Primary configuration file                                                //
///////////////////////////////////////////////////////////////////////////////
var os = require("os");

var environments = {
    ///////////////////////////////////////////////////////////////////////////
    // Development options                                                   //
    ///////////////////////////////////////////////////////////////////////////
    "development": {
        sessionSecret: "secret",
        environment: process.env.NODE_ENV,
        listenPort: process.env.PORT || 8080,
        ip: process.env.IP || '127.0.0.1',
        allowCrossDomain: false,
        autoStart: true,
        ttl: (1000 * 60 * 100), // 10 minutes
        resetTokenExpiresMinutes: 20,
        mongoUrl: {
            hostname: "paulo.mongohq.com",
            port: 10026,
            username: "admin",
            password: "admin",
            name: "",
            db: "apicatus"
        }
    },
    ///////////////////////////////////////////////////////////////////////////
    // Testing options                                                       //
    // Warning: DB must be empty, do not use dev or prod databases           //
    ///////////////////////////////////////////////////////////////////////////
    "test": {
        sessionSecret: "secret",
        environment: process.env.NODE_ENV,
        listenPort: process.env.PORT || 8080,
        ip: process.env.IP || os.hostname(),
        allowCrossDomain: false,
        autoStart: false,
        ttl: 1000,
        resetTokenExpiresMinutes: 20,
        mongoUrl: {
            hostname: "paulo.mongohq.com",
            port: 10026,
            username: "admin",
            password: "admin",
            name: "",
            db: "apicatus"
        }
    },
    ///////////////////////////////////////////////////////////////////////////
    // Production options OpenShift                                          //
    ///////////////////////////////////////////////////////////////////////////
    production: {
        sessionSecret: "secret",
        environment: process.env.NODE_ENV,
        listenPort: process.env.OPENSHIFT_NODEJS_PORT,
        ip: process.env.OPENSHIFT_NODEJS_IP,
        allowCrossDomain: false,
        autoStart: true,
        ttl: 3600000,
        resetTokenExpiresMinutes: 20,
        mongoUrl: {
            hostname: process.env.OPENSHIFT_MONGODB_DB_HOST,
            port: process.env.OPENSHIFT_MONGODB_DB_PORT,
            username: "admin",
            password: "admin",
            name: "",
            db: "apicatus"
        }
    }
}
module.exports = (function(){
    var env = process.env.NODE_ENV || 'production';
    return environments[env];
})();