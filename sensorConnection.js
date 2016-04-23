logger = require("winston");
frameFactory = require("./frame");

module.exports.create = function (socket, connectionClosedHandler) {
    var sensorConnection = {
        close: close,
        sendConfirmationFrameAsync: sendConfirmationFrameAsync,
        sendStatusFrameAsync: sendStatusFrameAsync,
        getIdentity: getIdentity
    };

    var identity = socket.remoteAddress + ":" + socket.remotePort;

    socket.on("end", function () {
        logger.info("Connection end: " + identity);
        socket.end();
    });

    socket.on("close", function (data) {
        logger.info("Connection closed: " + identity);

        connectionClosedHandler(sensorConnection);
    });

    socket.on("error", function (err) {
        logger.error("Connection error " + identity + ": " + JSON.stringify(err));
    });

    function getIdentity() {
        return identity;
    }

    function close() {
        socket.end();
    }

    function sendConfirmationFrameAsync() {
        return new Promise(function (resolve, reject) {
            var confirmationFrame = frameFactory
                .createConfirmationFrame();

            socket.write(confirmationFrame.getBytes(), function (err) {
                if (err) { reject(err); }
                else { resolve(); }
            });
        });
    }
    
    function sendStatusFrameAsync() {
        return new Promise(function (resolve, reject) {
            var statusFrame = frameFactory
                .createStatusFrame();

            socket.write(statusFrame.getBytes(), function (err) {
                if (err) { reject(err); }
                else { resolve(); }
            });
        });
    }

    return sensorConnection;
}