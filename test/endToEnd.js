var logger = require("winston");
var Promise = require("bluebird");
var should = require("should");
var sensorAgentFactory = require("../sensorAgent");
var webSinkRequestFactory = require("./webSinkRequest");

describe("Full end to end tests", function () {

    logger.remove(logger.transports.Console);
    logger.add(logger.transports.Console, { "timestamp": true, "colorize": true });
    logger.level = "fatal";

    const config = {
        webSinkPort: 6001
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

});