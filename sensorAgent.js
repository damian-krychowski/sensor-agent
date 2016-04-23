var webSinkFactory = require("./webSink");
var sensorConnectionManagerFactory = require("./sensorConnectionManager");

module.exports.create = function(config){
    var sensorAgent = {
        startAsync: startAsync,
        stopAsync: stopAsync,
        
        collectDataFromSensorsAsync:collectDataFromSensorsAsync,
        exposeData: exposeData   
    }
    
    var webSink = webSinkFactory.create(config);
    var sensorConnectionManager = sensorConnectionManagerFactory.create(config, exposeData);
    
    function startAsync(){
        return webSink.startAsync()
            .then(() => sensorConnectionManager.startAsync());
    }
    
    function stopAsync(){
        return webSink.stopAsync()
            .then(() => sensorConnectionManager.stopAsync());
    }
    
    function collectDataFromSensorsAsync(){
        return sensorConnectionManager
            .collectDataFromSensorsAsync();
    }
        
    function exposeData(newData){
        webSink.exposeData(newData);
    }
        
    return sensorAgent;
}