import updateDb from './update-db'

// Note: .push() wasn't the solution to updating state. See https://stackoverflow.com/a/60957646 - material-table doesn't work with hooks

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