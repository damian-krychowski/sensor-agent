var Promise = require("bluebird");
var net = require("net");
var logger = require("winston");
var frameFactory = require("./frame");
var sensorConnectionFactory = require("./sensorConnection");

module.exports.create = function (config) {
    var sensorConnectionManager = {
        startAsync: startAsync,
        stopAsync: stopAsync,
        collectDataFromSensorsAsync: collectDataFromSensorsAsync
    }

    var server;

    function startAsync() {
        return new Promise(function (resolve, reject) {
            server = net.createServer(createConnection);

            server.listen(config.sensorServerPort, config.sensorServerHost, function (err) {
                if (err) { reject(err); }
                else { resolve(); }
            });
        }).then(() => logger.info("Sensor server is started " + config.sensorServerHost + ":" + config.sensorServerPort));
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

    function collectDataFromSensorsAsync() {
        var sendStatusPromises = [];

        connections.forEach(sensorConnection =>{
           sendStatusPromises.push(
               sensorConnection.sendStatusFrameAsync()); 
        });

        return Promise.all(sendStatusPromises);
    }

    var connections = [];

    function createConnection(socket) {
        var sensorConnection = sensorConnectionFactory.create(
            socket,
            connectionClosed
        );

        connections.push(sensorConnection);

        sensorConnection
            .sendConfirmationFrameAsync()
            .then(() => logger.info("Confirmation frame sent to sensor - " + sensorConnection.getIdentity()));
    }

    function closeConnections() {
        connections.forEach(
            sensorConnection => sensorConnection.close());
    }

    function connectionClosed(sensorConnection) {
        var index = connections.indexOf(sensorConnection);
        connections.splice(index, 1);
    }

    return sensorConnectionManager;
}