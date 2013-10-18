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
        hostname: "alex.mongohq.com",
        port: 10062,
        username: "admin",
        password: "12345",
        name: "",
        db: "cloud-db"
    }
};

module.exports = conf;