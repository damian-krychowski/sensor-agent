module.exports.create = function (config) {
    var webSink = {
        startAsync: startAsync,
        stopAsync: stopAsync,
        exposeData: exposeData
    };

    function startAsync() {
    }

    function stopAsync() {
    }

    function exposeData(newValue) {
    }

    return webSink;
}