import updateDb from './update-db'

const updateTableState = (newRow, oldRow, type, tabletitle, tableState, setTableState) => {
    return new Promise((resolve, reject) => {
      try {
        const payload = {
          ...newRow,
          // This gets overwritten, but no worries - it'll be off by seconds at max.
          date_updated: new Date()
        }
        const tableCopy = [...tableState];
        const index = oldRow.tableData.id;
        tableCopy[index] = payload;
        setTableState(tableCopy);
        console.log("Table state updated!");
        resolve(payload);
      } catch (err) {
        // This doesn't do anything and it's uncatched, but should be here so...
        reject(err);
      }
    }).then((payload) => {
      // Update database after state updated. Arguably this should be done the other way around.
      updateDb(payload, type, tabletitle);
    });
  }

  export default updateTableState