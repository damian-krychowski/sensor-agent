var logger = require("winston");

module.exports.create = function() {
    var heartbeat = {
        start: start,
        stop: stop
    }

    var shouldExecute = false;
    var task;

    function start(promise, delay) {
        shouldExecute = true;
        interval(promise, delay);
    }

    function stop() {
        shouldExecute = false;
        clearTimeout(task);
    }

    function interval(promise, wait) {
        var interv = function(w) {
            return function() {
                if (shouldExecute) {
                    logger.debug("Heartbeat will be executed.");
                    promise.call(null)
                        .then(() => logger.debug("Heartbeat was executed."))
                        .then(() =>  task = setTimeout(interv, w));
                }
            };
        } (wait);

        task = setTimeout(interv, wait);
    };

    return heartbeat;
}