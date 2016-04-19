var webSinkFactory = require("./webSink");
var sensorConnectionManagerFactory = require("./sensorConnectionManager");

module.exports.create = function(config){
    var sensorAgent = {
        startAsync: startAsync,
        stopAsync: stopAsync,
        
        exposeData: exposeData,        
    }
    
    var webSink = webSinkFactory.create(config);
    var sensorConnectionManager = sensorConnectionManagerFactory.create(config);
    
    function startAsync(){
        return webSink.startAsync()
            .then(() => sensorConnectionManager.startAsync());
    }
    
    function stopAsync(){
        return webSink.stopAsync()
            .then(() => sensorConnectionManager.stopAsync());
    }
    
    function exposeData(newData){
        webSink.exposeData(newData);
    }
    
    return sensorAgent;
}