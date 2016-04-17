var request = require("request-promise");

module.exports.create = function(webSinkUrl) {
    var webSinkRequest = {
        executeAsync: executeAsync
    };

    function executeAsync(subzoneId, availableBays) {
        var options = {
            method: "GET",
            uri: webSinkUrl,
            json: true
        }

        return request(options);
    }

    return webSinkRequest;
}