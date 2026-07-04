const { catalyst26Engine } = require("./services-engine");

const mockStore = { tables: {} };

const catalystMock = {
  initialize: function () {
    return {
      datastore: () => ({
        table: (name) => {
          if (!mockStore.tables[name]) mockStore.tables[name] = [];
          const rows = mockStore.tables[name];
          return {
            getAllRows: async () =>
              rows.map((r) => {
                const key = name.slice(0, -1);
                return { [key]: { ...r } };
              }),
            insertRow: async (row) => {
              rows.push(row);
            },
          };
        },
      }),
      functions: () => ({
        execute: (name, payload) =>
          catalyst26Engine.executeServerlessFunction(name, payload),
      }),
      stratus: () => ({
        bucket: (name) => ({
          upload: (f, c) =>
            catalyst26Engine.stratusStorageOperation(name, "UPLOAD", f, c),
        }),
      }),
      cache: () => ({
        get: (k) => catalyst26Engine.cacheOperation("GET", k),
        put: (k, v, ttl) => catalyst26Engine.cacheOperation("PUT", k, v, ttl),
      }),
      quickml: () => ({
        rag: (p, kb) => catalyst26Engine.quickMlRagQuery(p, kb),
        pipeline: (id, d) => catalyst26Engine.runNoCodeMlPipeline(id, d),
      }),
      zia: () => ({
        vision: (t, p) => catalyst26Engine.ziaVisionAnalyze(t, p),
        voice: (t, p, sl, tl) => catalyst26Engine.ziaVoiceAndNlp(t, p, sl, tl),
        automl: (m, f) => catalyst26Engine.ziaAutoMlPredict(m, f),
      }),
      smartbrowz: () => ({
        generate: (html, t) =>
          catalyst26Engine.smartBrowzGenerateReport(html, t),
      }),
      auth: () => ({
        authenticate: (c) => catalyst26Engine.authenticateUser(c),
      }),
      signals: () => ({
        trigger: (e, p) => catalyst26Engine.triggerEventFunction(e, p),
        broadcast: (t, m) => catalyst26Engine.broadcastSignal(t, m),
      }),
      circuits: () => ({
        execute: (name, s) => catalyst26Engine.executeCircuitWorkflow(name, s),
      }),
      mail: () => ({
        send: (to, sub, b) =>
          catalyst26Engine.sendTransactionalMail(to, sub, b),
      }),
      push: () => ({
        send: (t, title, b) =>
          catalyst26Engine.sendPushNotification(t, title, b),
      }),
      engine: catalyst26Engine,
    };
  },
  engine: catalyst26Engine,
};

function setMockData(tableName, data) {
  mockStore.tables[tableName] = data;
}

module.exports = { catalystMock, setMockData, catalyst26Engine };
