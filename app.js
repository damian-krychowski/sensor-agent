var logger = require("winston");
var sensorAgentFactory = require("./sensorAgent");
var config = require("./config")

var sensorAgent = sensorAgentFactory.create(config);

sensorAgent
    .startAsync()
    .catch(err => logger.error(err.toString()));