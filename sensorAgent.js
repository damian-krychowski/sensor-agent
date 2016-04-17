var webSinkFactory = require("./webSink");

module.exports.create = function(config){
    var sensorAgent = {
        startAsync: startAsync,
        stopAsync: stopAsync,
        
        exposeData: exposeData,        
    }
    
    var webSink = webSinkFactory.create(config);
    
    function startAsync(){
        return webSink.startAsync();
    }
    
    function stopAsync(){
        return webSink.stopAsync();
    }
    
    function exposeData(newData){
        webSink.exposeData(newData);
    }
    
    return sensorAgent;
}