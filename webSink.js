var Promise = require("bluebird");
var express = require("express");
var logger = require("winston");
var config = require("./config");

module.exports.create = function (config) {
    var webSink = {
        startAsync: startAsync,
        stopAsync: stopAsync,
        exposeData: exposeData
    };

    var server = express();
    var currentState;
    var sensorHttpServer;

    server.get("/sensors", function (req, res) {
        res.send(currentState);
    });

    function startAsync() {
        return new Promise(function (resolve, reject) {
            sensorHttpServer = server.listen(config.webSinkPort, function (err) {
                if (err) { reject(err); }
                else { resolve(); }
            });
        }).then(() => logger.info("Sensor web sink is started on port " + config.webSinkPort));
    }

    function stopAsync() {
        return new Promise(function (resolve, reject) {
            sensorHttpServer.close(function (err) {
                if (err) { reject(err); }
                else { resolve(); }
            });

        }).then(() => logger.info("Sensor web sink on " + config.webSinkPort + " port is stopped."));
    }

    function exposeData(newValue) {
        currentState = newValue;
    }

    return webSink;
}