const mockStore = { tables: {} };

const catalystMock = {
  initialize: function () {
    return {
      datastore: () => ({
        table: (name) => {
          if (!mockStore.tables[name]) mockStore.tables[name] = [];
          const rows = mockStore.tables[name];
          return {
            getAllRows: async () => rows.map(r => {
              const key = name.slice(0, -1);
              return { [key]: { ...r } };
            }),
            insertRow: async (row) => { rows.push(row); },
          };
        },
      }),
    };
  },
};

function setMockData(tableName, data) {
  mockStore.tables[tableName] = data;
}

module.exports = { catalystMock, setMockData };