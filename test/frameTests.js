var logger = require("winston");
var should = require("should");
var frameFactory = require("../frame");

describe("Creating frames from bytes", function () {
    it("Confirmation frame should be created from bytes array", function () {
        //                                                     STX,   FC,  CRC,  ETX 
        frame = frameFactory.createFrameFromBytes(new Buffer([0x01, 0x01, 0x00, 0x02]));

        frame.isConfirmation().should.be.true();

        frame.isStatus().should.not.be.true();
        frame.isData().should.not.be.true();
        frame.isNack().should.not.be.true();
    });

    it("Status frame should be created from bytes array", function () {
        //                                                     STX,   FC,  CRC,  ETX 
        frame = frameFactory.createFrameFromBytes(new Buffer([0x01, 0x02, 0x00, 0x02]));

        frame.isStatus().should.be.true();

        frame.isConfirmation().should.not.be.true();
        frame.isData().should.not.be.true();
        frame.isNack().should.not.be.true();
    });

    it("Data frame should be created from bytes array", function () {
        //                                                     STX,   FC,   ID,   DL,   DH,  CRC,  ETX
        frame = frameFactory.createFrameFromBytes(new Buffer([0x01, 0x03, 0x01, 0x02, 0x03, 0x00, 0x02]));

        frame.isData().should.be.true();
        frame.getSensorId().should.be.eql(1);
        frame.getSensorValue().should.be.eql(5);

        frame.isConfirmation().should.not.be.true();
        frame.isStatus().should.not.be.true();
        frame.isNack().should.not.be.true();
    });

    it("Nack frame should be created from bytes array", function () {
        //                                                     STX,   FC,  ERR,  CRC,  ETX
        frame = frameFactory.createFrameFromBytes(new Buffer([0x01, 0x04, 0x01, 0x00, 0x02]));

        frame.isNack().should.be.true();
        frame.getErrorCode().should.be.eql(1);

        frame.isConfirmation().should.not.be.true();
        frame.isStatus().should.not.be.true();
        frame.isData().should.not.be.true();
    });

    it("Should throw on wrong crc value", function (done) {
        try {
            //                                                     STX,   FC,  CRC,  ETX 
            frame = frameFactory.createFrameFromBytes(new Buffer([0x01, 0x01, 0xFF, 0x02]));
        } catch (error) {
            done();
        }
    });

    it("Should throw on unkown frame type", function (done) {
        try {
            //                                                     STX,   FC,  CRC,  ETX 
            frame = frameFactory.createFrameFromBytes(new Buffer([0x01, 0xFF, 0x00, 0x02]));
        } catch (error) {
            done();
        }
    });

    it("Should throw on wrong frame format", function (done) {
        try {                                                 
            frame = frameFactory.createFrameFromBytes(new Buffer([0xFF, 0xFF]));
        } catch (error) {
            done();
        }
    });
});

describe("Creating frames with convinient functions", function () {
    it("Confirmation frame should be created", function () {
        frame = frameFactory.createConfirmationFrame();

        frame.isConfirmation().should.be.true();

        frame.isStatus().should.not.be.true();
        frame.isData().should.not.be.true();
        frame.isNack().should.not.be.true();
    });

    it("Status frame should be created", function () {
        frame = frameFactory.createStatusFrame();

        frame.isStatus().should.be.true();

        frame.isConfirmation().should.not.be.true();
        frame.isData().should.not.be.true();
        frame.isNack().should.not.be.true();
    });

    it("Data frame should be created", function () {
        frame = frameFactory.createDataFrame(1, 5);

        frame.isData().should.be.true();
        frame.getSensorId().should.be.eql(1);
        frame.getSensorValue().should.be.eql(5);

        frame.isConfirmation().should.not.be.true();
        frame.isStatus().should.not.be.true();
        frame.isNack().should.not.be.true();
    });

    it("Nack frame should be created", function () {
        frame = frameFactory.createNackFrame(1)

        frame.isNack().should.be.true();
        frame.getErrorCode().should.be.eql(1);

        frame.isConfirmation().should.not.be.true();
        frame.isStatus().should.not.be.true();
        frame.isData().should.not.be.true();
    });    
});