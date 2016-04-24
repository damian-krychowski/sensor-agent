var Promise = require("bluebird");
var logger = require("winston");

module.exports.create = function () {
    var heartbeat = {
        start: start,
        stopAsync: stopAsync
    }

    var shouldExecute = false;
    var task;

    function start(promise, delay) {
        shouldExecute = true;
        interval(promise, delay);
    }

    function stopAsync() {
        return new Promise(function (resolve, reject) {
            shouldExecute = false;
            clearTimeout(task);
            resolve();
        });
    }

    function interval(promise, wait) {
        var interv = function (w) {
            return function () {
                if (shouldExecute) {
                    logger.debug("Heartbeat will be executed.");
                    promise.call(null)
                        .then(() => logger.debug("Heartbeat was executed."))
                        .then(() => task = setTimeout(interv, w));
                }
            };
        } (wait);

        task = setTimeout(interv, wait);
    };

    return heartbeat;
}