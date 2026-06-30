const Module = require("module");
const path = require("path");
const { catalystMock, setMockData } = require("./sdk-mock");
const FalkorMock = require("./falkor-mock");

const origResolve = Module._resolveFilename;
const CATALYST_DIR = __dirname;

Module._resolveFilename = function (request, parent) {
  if (request === "@zmc/catalyst") {
    return path.join(CATALYST_DIR, "sdk-mock-stub.js");
  }
  const resolved = origResolve.call(this, request, parent);
  if (resolved.includes(path.join("backend", "graph", "client.js"))) {
    return path.join(CATALYST_DIR, "falkor-mock.js");
  }
  return resolved;
};

require.cache[path.join(CATALYST_DIR, "sdk-mock-stub.js")] = {
  exports: catalystMock,
};

const handlers = {
  "entity-extraction": require("./functions/entity-extraction"),
  "crime-dna-analyzer": require("./functions/crime-dna-analyzer"),
  "alert-generator": require("./functions/alert-generator"),
  "nlu-pipeline": require("./functions/nlu-pipeline"),
  "forecast-trigger": require("./functions/forecast-trigger"),
  "similar-cases": require("./functions/similar-cases"),
};

Module._resolveFilename = origResolve;

function setStoreData(tableName, data) {
  setMockData(tableName, data);
}

module.exports = { handlers, setStoreData };