module.exports.create = function(){
    var sensorDataCache = {
        getData: getData,
        update: update
    };
    
    var data = [];
    
    function getData(){
        return data.slice();
    }
    
    function update(sensorData){
        data = data.filter(data => data.sensorId != sensorData.sensorId);
        data.push(sensorData);
    }
    
    return sensorDataCache;
}