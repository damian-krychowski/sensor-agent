var Promise = require("bluebird");
var net = require("net");
var logger = require("winston");

module.exports.create = function(){
    var sensor = {
        withServerHost: withServerHost,
        withServerPort: withServerPort,
        connectAsync: connectAsync
    }
    
    var serverHost, serverPort;
    var client = new net.Socket();
    var identity;
    var receivedData = [];
    var receivedDataCounter = 0;
    
    function withServerHost(host){
        serverHost = host;
        return sensor;
    }
    
    function withServerPort(port){
        serverPort = port;
        return sensor;
    }
    
    client.on("data", function(data) {
        receivedData.push(data);
        receivedDataCounter++;
        
        if(receivedDataCounter === 1){
            sensor.firstReceivedFrame = data;
        }
    });

     function connectAsync() {
        return new Promise(function(resolve, reject) {
            client.connect(serverPort, serverHost, function(err) {
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