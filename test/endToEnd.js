var logger = require("winston");
var should = require("should");
var sensorAgentFactory = require("../sensorAgent");
var webSinkRequestFactory = require("./webSinkRequest");
var sensorFactory = require("./sensor");
var frameFactory = require("../frame");

describe("Full end to end tests", function () {

    logger.remove(logger.transports.Console);
    logger.add(logger.transports.Console, { "timestamp": true, "colorize": true });
    logger.level = "fatal";

    const config = {
        webSinkPort: 6001,
        sensorServerPort: 6002,
        sensorServerHost: "localhost"
    };

    const webSinkUrl = "http://localhost:" + config.webSinkPort + "/sensors";

    var sensorAgent;
    var webSinkRequest = webSinkRequestFactory.create(webSinkUrl);

    beforeEach(function () {
        sensorAgent = sensorAgentFactory.create(config);
    });

    afterEach(function () {
        return sensorAgent.stopAsync();
    });

    it("sensorAgent should accept connection from sensor and reply with CONFIRMATION frame", function () {
        var sensor = sensorFactory.create()
            .withServerHost("localhost")
            .withServerPort(6002);

        return sensorAgent
            .startAsync()
            .then(() => sensor.connectAsync())
            .delay(50)
            .then(() => sensor.firstReceivedFrame.should.be.eql(confirmationFrame()));
    });

    it("sensorAgent should accept connections from more than one sensor", function () {
        var firstSensor = sensorFactory.create()
            .withServerHost("localhost")
            .withServerPort(6002);

        var secondSensor = sensorFactory.create()
            .withServerHost("localhost")
            .withServerPort(6002);

        return sensorAgent
            .startAsync()
            .then(() => firstSensor.connectAsync())
            .then(() => secondSensor.connectAsync())
            .delay(50)
            .then(() => firstSensor.firstReceivedFrame.should.be.eql(confirmationFrame()))
            .then(() => secondSensor.firstReceivedFrame.should.be.eql(confirmationFrame()));
    });

    it("sensorAgent should accept second connection from the sensor if the first connection was lost", function () {
        var sensor = sensorFactory.create()
            .withServerHost("localhost")
            .withServerPort(6002);

        return sensorAgent
            .startAsync()
            .then(() => sensor.connectAsync())
            .delay(25)
            .then(() => sensor.destroyConnection())
            .delay(25)
            .then(() => sensor.connectAsync())
            .delay(50)
            .then(() => sensor.firstReceivedFrame.should.be.eql(confirmationFrame()))
            .then(() => sensor.secondReceivedFrame.should.be.eql(confirmationFrame()))
    });

    it("sensorAgent should send STATUS frame to acquire data from the sensor", function () {
        var sensor = sensorFactory.create()
            .withServerHost("localhost")
            .withServerPort(6002);

        return sensorAgent
            .startAsync()
            .then(() => sensor.connectAsync())
            .delay(50)
            .then(() => sensorAgent.collectDataFromSensorsAsync())
            .delay(50)
            .then(() => sensor.firstReceivedFrame.should.be.eql(confirmationFrame()))
            .then(() => sensor.secondReceivedFrame.should.be.eql(statusFrame()))
    });

    function statusFrame() {
        return frameFactory
            .createStatusFrame()
            .getBytes();
    }

    it("sensorAgent should close connection with the sensor on receiving NACK frame", function () {
        var sensor = sensorFactory.create()
            .withServerHost("localhost")
            .withServerPort(6002)
            .withFramesToRespondWith([
                nackFrame({ errorCode: 0x01 })
            ]);

        return sensorAgent
            .startAsync()
            .then(() => sensor.connectAsync())
            .delay(50)
            .then(() => sensorAgent.collectDataFromSensorsAsync())
            .delay(50)
            .then(() => sensor.isConnected().should.not.be.true());
    });

    function nackFrame(nackData) {
        return frameFactory
            .createNackFrame(nackData.errorCode)
            .getBytes();
    }

    it("sensorAgent should close connection with the sensor on receiving unknown frame", function () {
        var sensor = sensorFactory.create()
            .withServerHost("localhost")
            .withServerPort(6002)
            .withFramesToRespondWith([
                new Buffer([0xFF, 0xFF])
            ]);

        return sensorAgent
            .startAsync()
            .then(() => sensor.connectAsync())
            .delay(50)
            .then(() => sensorAgent.collectDataFromSensorsAsync())
            .delay(50)
            .then(() => sensor.isConnected().should.not.be.true());
    });

    it("sensorAgent should expose data acquired from the sensors", function () {
        var firstSensor = sensorFactory.create()
            .withServerHost("localhost")
            .withServerPort(6002)
            .withFramesToRespondWith([
                dataFrame({sensorId: 1, sensorValue: 25})
            ]);

        var secondSensor = sensorFactory.create()
            .withServerHost("localhost")
            .withServerPort(6002)
            .withFramesToRespondWith([
                dataFrame({sensorId: 2, sensorValue: 10})
            ]);

        return sensorAgent
            .startAsync()
            .then(() => firstSensor.connectAsync())
            .then(() => secondSensor.connectAsync())
            .delay(50)
            .then(() => sensorAgent.collectDataFromSensorsAsync())
            .delay(50)
            .then(() => webSinkRequest.executeAsync())
            .then(acquiredData => acquiredData.should.be.eql([
                { sensorId: 1, value: 25 },
                { sensorId: 2, value: 10 }
            ]));
    });

    function dataFrame(data) {
        return frameFactory
            .createDataFrame(data.sensorId, data.sensorValue)
            .getBytes();
    }

    function confirmationFrame() {
        return frameFactory
            .createConfirmationFrame()
            .getBytes()
    }
});