var Promise = require("bluebird");
var net = require("net");
var logger = require("winston");

module.exports.create = function(config, frameReceivedHandler){
    var sensor = {
        connectAsync: connectAsync
    }
    
    var client = new net.Socket();
    var identity;
    
    client.on("data", function(data) {
        frameReceivedHandler(data);
    });

     function connectAsync() {
        return new Promise(function(resolve, reject) {
            client.connect(config.serverPort, config.serverHost, function(err) {
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
    
    return sensor;
}