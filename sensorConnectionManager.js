var Promise = require("bluebird");
var net = require("net");
var logger = require("winston");

module.exports.create = function (config) {
    var sensorConnectionManager = {
        startAsync: startAsync,
        stopAsync: stopAsync
    }

    var server;
    var connections = [];

    function startAsync() {
        return new Promise(function (resolve, reject) {
            server = net.createServer(createConnection);

            server.listen(config.sensorServerPort, config.sensorServerHost, function (err) {
                if (err) { reject(err); }
                else { resolve(); }
            });
        }).then(() => logger.info("Sensor server started on " + config.sensorServerPort + " port."));
    }

    function stopAsync() {
        return new Promise(function (resolve, reject) {
            closeConnections();
            
            server.close(function (err) {
                if (err) { reject(err); }
                else { resolve(); }
            });
        }).then(() => logger.info("Sensor server is stopped"));
    }

    function createConnection(newConnection) {
        connections.push(newConnection);
        newConnection.write(new Buffer([0x01, 0x02, 0x03, 0x04]));
    }
    
    function closeConnections(){
        connections.forEach(conn => conn.end());
    }

    return sensorConnectionManager;
}