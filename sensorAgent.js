var webSinkFactory = require("./webSink");
var sensorConnectionManagerFactory = require("./sensorConnectionManager");
var heartbeatFactory = require("./heartbeat");

module.exports.create = function (config) {
    const THIRTY_SECONDS = 30 * 1000;

    var sensorAgent = {
        startAsync: startAsync,
        stopAsync: stopAsync,

        collectDataFromSensorsAsync: collectDataFromSensorsAsync
    }

    var webSink = webSinkFactory.create(config);
    var sensorConnectionManager = sensorConnectionManagerFactory.create(config, exposeData);
    var heartbeat = heartbeatFactory.create();

    function startAsync() {
        return webSink.startAsync()
            .then(() => sensorConnectionManager.startAsync())
            .then(() => heartbeat.start(collectDataFromSensorsAsync, THIRTY_SECONDS))
    }

    function stopAsync() {
        return heartbeat.stopAsync()                 
            .then(() => sensorConnectionManager.stopAsync())
            .then(() => webSink.stopAsync());
    }

    function collectDataFromSensorsAsync() {
        return sensorConnectionManager
            .collectDataFromSensorsAsync();
    }

    function exposeData(newData) {
        webSink.exposeData(newData);
    }

    return sensorAgent;
}