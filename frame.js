const STX = 0x01;
const ETX = 0x02;

const CONFIRMATION_FRAME_CODE = 0x01;
const STATUS_FRAME_CODE = 0x02;
const DATA_FRAME_CODE = 0x03;
const NACK_FRAME_CODE = 0x04;

module.exports.createFrameFromBytes = function(bytes){
    var frame ={
        getBytes: getBytes,
        isConfirmation: isConfirmation,
        isStatus: isStatus,
        isData: isData,
        isNack: isNack,
        getSensorId: getSensorId,
        getSensorValue: getSensorValue,
        getErrorCode: getErrorCode
    }
    
    function getBytes(){
        return bytes;
    }
    
    function isStatus(){
        
    }
    
    function isConfirmation(){
        
    }
    
    function isData(){
        
    }
    
    function isNack(){
        
    }
    
    function getSensorId(){
        
    }
    
    function getSensorValue(){
        
    }
    
    function getErrorCode(){
        
    }
    
    return frame;
}

module.exports.createConfirmationFrame = function(){
    
}

module.exports.createDataFrame = function(sensorId, sensorValue){
    
}

module.exports.createStatusFrame = function(){
    
}

module.exports.createNackFrame = function(errorCode){
    
}