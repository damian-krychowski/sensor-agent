var should = require("should");
var sensorDataCacheFactory = require("../sensorDataCache");

describe("Caching sensors data", function () {
    it("Cache should be initialized as empty", function () {
        var sensorDataCache = sensorDataCacheFactory.create();
        sensorDataCache.getData().should.be.eql([]);
    });

    it("Cache should accept new sensors data", function () {
        var sensorDataCache = sensorDataCacheFactory.create();

        sensorDataCache.update({
            sensorId: 1,
            value: 10
        });

        sensorDataCache.update({
            sensorId: 2,
            value: 15
        });

        sensorDataCache.getData().should.be.eql([
            {
                sensorId: 1,
                value: 10
            },
            {
                sensorId: 2,
                value: 15
            }
        ]);
    });

    it("Cache should update stale sensor data with fresh one", function () {
        var sensorDataCache = sensorDataCacheFactory.create();

        sensorDataCache.update({
            sensorId: 1,
            value: 10
        });

        sensorDataCache.update({
            sensorId: 1,
            value: 15
        });

        sensorDataCache.getData().should.be.eql([
            {
                sensorId: 1,
                value: 15
            }
        ]);
    });
});