import updateDb from './update-db'
import {getItemScore} from '../functions/scoring'

// Note: .push() wasn't the solution to updating state. See https://stackoverflow.com/a/60957646 - material-table doesn't work with hooks
// Both of these options update the database after state updated. Arguably this should be done the other way around.

const tryUpdateTable = (operation, oldRow, tableTitle, tableState, setTableState, type, pointSystem, newRow) => {
  // If the operation is delete - run a seperate function for deleting state & db entry
  if (!newRow && operation === 'delete') {
    return new Promise((resolve) => {
      const tableCopy = [...tableState];
      const index = oldRow.tableData.id;
      tableCopy.splice(index, 1);
      setTableState(tableCopy);
      console.log("Row spliced from table state!");
      resolve(oldRow);
    }).then((oldRow) => {
      updateDb('delete', type, oldRow);
    });
  }
  // Else, construct a payload
  let payload = {};
  // TODO: Integrate with score system
  if (!newRow && operation === 'recalc') {
    payload = JSON.parse(JSON.stringify({
      guild: oldRow.guild,
      owner_name: oldRow.owner_name,
      name: oldRow.name,
      comments: oldRow.comments,
      score: 0,
      description: oldRow.description,
      stage: oldRow.stage,
      analytics_url: oldRow.analytics_url,
      spec_url: oldRow.spec_url,
      code_repo: oldRow.code_repo,
      points: oldRow.points,
      origcontentpoints: oldRow.origcontentpoints,
      transcontentpoints: oldRow.transcontentpoints,
      eventpoints: oldRow.eventpoints,
      managementpoints: oldRow.managementpoints,
      outstandingpoints: oldRow.outstandingpoints,
    }))
    payload.score = getItemScore(payload, pointSystem, type)
    console.log("Score recalculated.")
  }
  if (operation === 'update') {
    payload = newRow
  }
  // Do nothing if the operation is update and there is no new row
  // This shouldn't ever be called and is more of a way of verifing there's a newRow if update is called
  if (!newRow && operation === 'update') {
    console.log("Table update called, but no newRow provided.")
  } else {
    payload.date_updated = new Date();
    return new Promise((resolve) => {
      const tableCopy = [...tableState];
      const index = oldRow.tableData.id;
      tableCopy[index] = payload;
      setTableState([...tableCopy]);
      console.log("Table state updated!");
      resolve(payload);
    }).then((payload) => {
      updateDb('update', type, payload, tableTitle);
    });
  }
}

export default tryUpdateTable