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

    it("sensorAgent should expose data acquired form sensors externally", function () {
        var sensorData = {
            sensorId: 1,
            sensorValue: 1000
        };

        return sensorAgent
            .startAsync()
            .then(() => sensorAgent.exposeData(sensorData))
            .then(() => webSinkRequest.executeAsync())
            .then(acquiredData => acquiredData.should.be.eql(sensorData));
    });

    it("sensorAgent should accept connection from sensor and reply with CONFIRMATION frame", function () {
        var receivedFrame;
        
        var sensor = sensorFactory
            .create({serverPort: 6002, serverHost: "localhost"}, frame => receivedFrame = frame);

        return sensorAgent
            .startAsync()
            .then(() => sensor.connectAsync())
            .delay(50)
            .then(() => receivedFrame.should.be.eql(
                frameFactory.createConfirmationFrame().getBytes()
            ));
    });
});