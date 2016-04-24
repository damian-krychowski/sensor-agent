var Promise = require("bluebird");
var should = require("should");
var hearbeatFactory = require("../heartbeat");

describe("Heartbeating", function () {
    it("Promise should be called exact number of times during specified period", function () {
        var counter = 0;

        var promise = function () {
            return new Promise(function (resolve, reject) {
                counter++;
                resolve();
            });
        };

        var heartbeat = hearbeatFactory.create();
        heartbeat.start(promise, 100);

        return Promise.delay(550)
            .then(() => heartbeat.stopAsync())
            .then(() => counter.should.be.eql(5));
    });
});