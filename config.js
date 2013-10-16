///////////////////////////////////////////////////////////////////////////////
// Primary configuration file                                                //
///////////////////////////////////////////////////////////////////////////////
var conf = {
    "sessionSecret": "secret",
    "listenPort": process.env.PORT || 8080,
    "ip": process.env.IP || 'localhost',
    "allowCrossDomain": false,
    "mongo_local": {
        "hostname": "localhost",
        "port": 27017,
        "username": "admin",
        "password": "admin",
        "name": "",
        "db": "apicatus"
    },
    "mongohq": {
        "hostname": "paulo.mongohq.com",
        "port": 10040,
        "username": "admin",
        "password": "admin",
        "name": "",
        "db": "apicatus"
    }
};

module.exports = conf;