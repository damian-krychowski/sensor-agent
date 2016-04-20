const STX = 0x01;
const STX_INDEX = 0x00;

const ETX = 0x02;

const FRAME_CODE_INDEX = 0x01;

const CONFIRMATION_FRAME_CODE = 0x01;
const CONFIRMATION_CRC_INDEX = 0x02;
const CONFIRMATION_ETX_INDEX = 0x03;

const STATUS_FRAME_CODE = 0x02;
const STATUS_CRC_INDEX = 0x02;
const STATUS_ETX_INDEX = 0x03;

const DATA_FRAME_CODE = 0x03;
const DATA_SENSOR_ID_INDEX = 0x02
const DATA_LOW_INDEX = 0x03;
const DATA_HIGH_INDEX = 0x04;
const DATA_CRC_INDEX = 0x05;
const DATA_ETX_INDEX = 0x06;

const NACK_FRAME_CODE = 0x04;
const NACK_ERROR_CODE_INDEX = 0x02;
const NACK_CRC_INDEX = 0x03;
const NACK_ETX_INDEX = 0x04;

function createFrameFromBytes(bytes) {
    var frame = {
        getBytes: getBytes,
        isConfirmation: isConfirmation,
        isStatus: isStatus,
        isData: isData,
        isNack: isNack,
        getSensorId: getSensorId,
        getSensorValue: getSensorValue,
        getErrorCode: getErrorCode
    }

    var frameType;
    verify();

    function getBytes() {
        return bytes;
    }

    function isStatus() {
        return frameType === "status";
    }

    function isConfirmation() {
        return frameType === "confirmation";
    }

    function isData() {
        return frameType === "data";
    }

    function isNack() {
        return frameType === "nack";
    }

    function getSensorId() {
        if (isData()) {
            return bytes[DATA_SENSOR_ID_INDEX];
        }
    }

    function getSensorValue() {
        if (isData()) {
            //todo modify due to specification
            return bytes[DATA_HIGH_INDEX] + bytes[DATA_LOW_INDEX];
        }
    }

    function getErrorCode() {
        if (isNack()) {
            return bytes[NACK_ERROR_CODE_INDEX];
        }
    }

    function verify() {
        byteShouldBeEqualTo(bytes, STX_INDEX, STX);
        verifyFrameCode();
    }

    function verifyFrameCode() {
        if (bytes[FRAME_CODE_INDEX] === CONFIRMATION_FRAME_CODE) {
            verifyConfirmationFrame();
        }
        else if (bytes[FRAME_CODE_INDEX] === STATUS_FRAME_CODE) {
            verifyStatusFrame();
        }
        else if (bytes[FRAME_CODE_INDEX] === DATA_FRAME_CODE) {
            verifyDataFrame();
        }
        else if (bytes[FRAME_CODE_INDEX] === NACK_FRAME_CODE) {
            verifyNackFrame();
        }
        else {
            throw new Error("Unkown frame code.")
        }
    }

    function verifyConfirmationFrame() {
        frameType = "confirmation";

        verifyCrc(bytes[CONFIRMATION_CRC_INDEX]);
        byteShouldBeEqualTo(bytes, CONFIRMATION_ETX_INDEX, ETX);
    }

    function verifyStatusFrame() {
        frameType = "status";

        verifyCrc(bytes[STATUS_CRC_INDEX]);
        byteShouldBeEqualTo(bytes, STATUS_ETX_INDEX, ETX);
    }

    function verifyDataFrame() {
        frameType = "data";

        //todo add data high and data low verification

        verifyCrc(bytes[DATA_CRC_INDEX]);
        byteShouldBeEqualTo(bytes, DATA_ETX_INDEX, ETX);
    }

    function verifyNackFrame() {
        frameType = "nack";

        //todo add error code verification        

        verifyCrc(bytes[NACK_CRC_INDEX]);
        byteShouldBeEqualTo(bytes, NACK_ETX_INDEX, ETX);
    }

    function verifyCrc(actualCrc) {
        //todo modify due to specification
        if (actualCrc != 0x00) {
            throw new Error("Wrong crc value. Actual: " + actualCrc + ", expected: " + 0x00);
        }
    }

    function byteShouldBeEqualTo(buffer, index, expected) {
        if (buffer[index] != expected) {
            throw new Error("Wrong byte value (" + buffer[index] + ") on " + index + " position. Expected " + expected);
        }
    }

    return frame;
}

module.exports.createFrameFromBytes = createFrameFromBytes;

module.exports.createConfirmationFrame = function () {
    var frameBytes = [STX, CONFIRMATION_FRAME_CODE];
    var crc = calculateCRC(frameBytes);
    
    frameBytes.push(crc);
    frameBytes.push(ETX);
    
    return createFrameFromBytes(frameBytes);
}

module.exports.createDataFrame = function (sensorId, sensorValue) {
    var frameBytes = [STX, DATA_FRAME_CODE, sensorId, 0, sensorValue];
    var crc = calculateCRC(frameBytes);
    
    frameBytes.push(crc);
    frameBytes.push(ETX);
    
    return createFrameFromBytes(frameBytes);
}

module.exports.createStatusFrame = function () {
    var frameBytes = [STX, STATUS_FRAME_CODE];
    var crc = calculateCRC(frameBytes);
    
    frameBytes.push(crc);
    frameBytes.push(ETX);
    
    return createFrameFromBytes(frameBytes);
}

module.exports.createNackFrame = function (errorCode) {
    var frameBytes = [STX, NACK_FRAME_CODE, errorCode];
    var crc = calculateCRC(frameBytes);
    
    frameBytes.push(crc);
    frameBytes.push(ETX);
    
    return createFrameFromBytes(frameBytes);
}

function calculateCRC(frameBytes){
    return 0x00;
}