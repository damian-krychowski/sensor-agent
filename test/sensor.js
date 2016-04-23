var Promise = require("bluebird");
var net = require("net");
var logger = require("winston");
var frameFactory = require("../frame");

module.exports.create = function () {
    var sensor = {
        withServerHost: withServerHost,
        withServerPort: withServerPort,
        withFramesToRespondWith: withFramesToRespondWith,
        withSensorId: withSensorId,
        withSensorValue: withSensorValue,
        connectAsync: connectAsync,
        destroyConnection: destroyConnection,
        dataFrame: dataFrame
    }

    var serverHost, serverPort;
    var client = new net.Socket();
    var identity;
    var receivedDataCounter = 0;
    var framesToRespondWith;
    var framesToRespondWithIndex = 0;
    var sensorId;
    var sensorValue;

    function withServerHost(host) {
        serverHost = host;
        return sensor;
    }

    function withServerPort(port) {
        serverPort = port;
        return sensor;
    }

    function withFramesToRespondWith(frames) {
        framesToRespondWith = frames.slice();
        return sensor;
    }

    function withSensorId(id) {
        sensorId = id;
        return sensor;
    }

    function withSensorValue(value) {
        sensorValue = value;
        return sensor;
    }
    
    function dataFrame(){
        return frameFactory
            .createDataFrame(sensorId, sensorValue)
            .getBytes();
    }

    client.on("data", function (data) {
        receivedDataCounter++;

        if (receivedDataCounter === 1) {
            sensor.firstReceivedFrame = data;
        }

        if (receivedDataCounter === 2) {
            sensor.secondReceivedFrame = data;
        }

        if (framesToRespondWith && framesToRespondWith[framesToRespondWithIndex]) {
            client.write(framesToRespondWith[framesToRespondWithIndex]);
            framesToRespondWithIndex++;
        }
    });

    function connectAsync() {
        return new Promise(function (resolve, reject) {
            client.connect(serverPort, serverHost, function (err) {
                if (err) {
                    logger.error("Client error " + err.toString());
                    reject(err);
                }
                else {
                    identity = client.localAddress + ":" + client.localPort;
                    resolve();
                }
            });
        });
    }

    function destroyConnection() {
        client.destroy();
    }

    return sensor;
}