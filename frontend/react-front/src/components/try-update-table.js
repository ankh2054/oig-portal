import updateDb from './update-db'
import {getItemScore} from '../functions/scoring'

// Note: .push() wasn't the solution to updating state. See https://stackoverflow.com/a/60957646 - material-table doesn't work with hooks
// Both of these options update the database after state updated. Arguably this should be done the other way around.

const tryUpdateTable = (operation, currentRow, tableTitle, tableState, setTableState, type, pointSystem, newRow) => {
  // If the operation is delete - run a seperate function for deleting state & db entry
  if (!newRow && operation === 'delete') {
    return new Promise((resolve) => {
      const tableCopy = [...tableState];
      const index = currentRow.tableData.id;
      tableCopy.splice(index, 1);
      setTableState(tableCopy);
      console.log("Row spliced from table state!");
      resolve(currentRow);
    }).then((currentRow) => {
      updateDb('delete', type, currentRow);
    });
  }
  // Else, construct a payload
  let payload = {};
  // TODO: Integrate with score system
  if (!newRow && (operation === 'recalc' || operation === 'create')) {
    payload = {
      ...(type === "guild" ? {
        guild_name: currentRow.guild_name,
        url: currentRow.url,
        account_name: currentRow.accountName
      } : {
        guild: currentRow.guild ? currentRow.guild : currentRow.owner_name,
        owner_name: currentRow.owner_name,
        comments: currentRow.comments,
        score: 0,
      }),
      ...(type === 'product' || type === 'bizdev' ? {
        name: currentRow.name,
        description: currentRow.description,
        stage: currentRow.stage,
        analytics_url: currentRow.analytics_url,
        spec_url: currentRow.spec_url,
        code_repo: currentRow.code_repo,
        points: currentRow.points,
      } : {}),
      ...(type === 'product' ? {
        code_repo: currentRow.code_repo
      } : {}),
      ...(type === 'community' ? {
        origcontentpoints: +currentRow.origcontentpoints,
        transcontentpoints: +currentRow.transcontentpoints,
        eventpoints: +currentRow.eventpoints,
        managementpoints: +currentRow.managementpoints,
        outstandingpoints: +currentRow.outstandingpoints,
      } : {})
    }
    if (type !== "guild") {
      payload.score = getItemScore(payload, pointSystem, type)
      console.log("Score (re)calculated.")
    }
  }
  if (operation === 'toggleActive') {
    const { guild_name, account_name, active } = currentRow;
    payload = {
      guild_name,
      account_name,
      active: active === "false" ? "true" : "false"
    }
    console.log(`Guild ${guild_name} active state set to ${active}`)
  }
  if (operation === 'update') {
    payload = newRow
  }
  // Do nothing if the operation is update and there is no new row
  // This shouldn't ever be called and is more of a way of verifing there's a newRow if update is called
  if (!newRow && operation === 'update') {
    console.log("Table update called, but no newRow provided.")
  } else {
    let dbPayload = null;
    if (type === "guild" || tableTitle === "Guild Settings") {
      dbPayload = payload;
      payload = {
        guild_name: payload.owner_name ? payload.owner_name : payload.guild_name,
        account_name: payload.account_name ? payload.account_name : null,
        active: !!payload.active ? payload.active : true
      }
    }
    return new Promise((resolve) => {
      const tableCopy = [...tableState];
      if (operation === 'create') {
        tableCopy.unshift(payload) 
      } else {
        const index = currentRow.tableData.id;
        tableCopy[index] = payload;
      }
      setTableState([...tableCopy]);
      console.log("Table state updated! Operation " + operation);
      resolve(dbPayload ? dbPayload : payload);
    }).then((payload) => {
      if (operation !== 'create') {
        updateDb('update', type, payload, tableTitle);
      }
    });
  }
}

export default tryUpdateTable