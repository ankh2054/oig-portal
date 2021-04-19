import React, { useState } from "react";
import MaterialTable from "material-table";
import { makeStyles } from '@material-ui/core/styles';
import { api_base } from "../config";
import axios from "axios";
import { Button } from '@material-ui/core';
import datec from '../functions/date'

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'inline-block',
    width: '100%'
  },
  materialTable: {
    margin: '25px auto',
    maxWidth: '1200px'
  },
  addItemButton: {
    position: 'relative',
    float: 'left',
    left: '10px',
    top: '-45px'
  },
  addItemButtonEmpty: {
    
  }
}))

export default function Table({ tabledata, tabletitle }) {
  const classes = useStyles();
  const [tableState, setTableState] = useState(tabledata);

  // Update row in database - now generic
  const updateDb = (payload) => {
    const date_updated = new Date();
    // TODO: calculate score
    const score = payload.score ? payload.score : 10;
    if (tabletitle === "Products") {
      const {
        owner_name,
        name,
        description,
        stage,
        analytics_url,
        spec_url,
        code_repo,
        points,
        comments
      } = payload;
      axios
        .post(api_base + "/api/productUpdate", {
          owner_name,
          name,
          description,
          stage,
          analytics_url,
          spec_url,
          code_repo,
          score,
          points,
          date_updated,
          comments
        })
        .then(() => {
          console.log(
            `Product '${name}' by ${owner_name} updated! Reload to confirm.`
          );
        });
    } else if (tabletitle === "Bizdevs") {
      const {
        owner_name,
        name,
        description,
        stage,
        analytics_url,
        spec_url,
        points,
        comments
      } = payload;
      axios
        .post(api_base + "/api/bizdevUpdate", {
          owner_name,
          name,
          description,
          stage,
          analytics_url,
          spec_url,
          score,
          points,
          date_updated,
          comments
        })
        .then(() => {
          console.log(
            `Bizdev '${name}' by ${owner_name} updated! Reload to confirm.`
          );
        });
    } else if (tabletitle === "Community") {
      const {
        owner_name,
        origcontentpoints,
        transcontentpoints,
        eventpoints,
        managementpoints,
        outstandingpoints,
        comments
      } = payload;
      axios
        .post(api_base + "/api/communityUpdate", {
          owner_name,
          origcontentpoints,
          transcontentpoints,
          eventpoints,
          managementpoints,
          outstandingpoints,
          score,
          date_updated,
          comments
        })
        .then(() => {
          console.log(
            `Community points for ${owner_name} updated! Reload to confirm.`
          );
        });
    } else if (tabletitle === "Tech Snapshot" || tabletitle === "Snapshot Tech Results") {
      const {
        owner_name, date_check, comments
      } = payload;
      axios
        .post(api_base + "/api/snapshotResultCommentUpdate", {
          owner_name, date_check, comments
        })
        .then(() => {
          console.log(
            `Comments on tech result for ${owner_name} updated! Reload to confirm.`
          );
        });
    } else if (tabletitle === "Point System") {
      const {
        points_type, points, multiplier
      } = payload;
      axios
        .post(api_base + "/api/updatePointSystem", {
          points_type, points, multiplier
        })
        .then(() => {
          console.log(
            `Points/multiplier for ${points_type} updated! Reload to confirm.`
          );
        });
    } else {
      console.log(`Unknown table type "${tabletitle}"...`);
    }
  };

  /* console.log(tabledata, tabletitle) 
  Function is called twice on normal load, and up to 4 times on a product update. Possible optimisation? 
  */

  const isEditable = (key, columnObj) => {
    if (!!columnObj['date_check']) {
      // If there is a date_check field, this is a tech result, and all fields bar comments should be uneditable
      return (key === "comments" ? "always" : "never")
    } else if (!!columnObj['points_type']) {
      // Points system - make point_type uneditable
      return (key === "points_type" ? "never" : "always")
    } else {
      // Otherwise for community, product, bizdev, all should be editable except score, name, guild, and date.
      return (key !== "name" && key !== "score" && key !== "guild" && key !== "date_updated" ? "always" : "never")
    }
  }

  const defaultCell = {
    //whiteSpace: 'nowrap'
  }

  const waxCell = {
    ...defaultCell,
    color: '#332b1f',
    background: 'linear-gradient(90.08deg, rgb(247, 142, 30), rgb(255, 220, 81) 236.03%)',
  }

  /* This function is called when table state is updated. Ideally it should not be, as columns aren't supposed to change. */
  const generateColumns = () => {
    // Set object from first object in array
    const columnObj = !!tableState[0] ? tableState[0] : {};
    // Create Columns from keys of object prop
    const columnsSetup = Object.keys(columnObj).map(function (key) {
      // Not sure if this will work for multiple types of items?
      const renderGuildLogo = (rowData) => <a href={'/guilds/' + rowData.owner_name} alt={rowData.owner_name}><img src={rowData.guild} alt={rowData.owner_name} /* Smart use of `style` */ style={{ width: 50, borderRadius: '50%' }} /></a>;
      const isDate = key === 'date_updated' || key === 'date_check' || key === 'snapshot_date';
      const dateHead = isDate ? key : null;
      const renderDate = (rowData) => datec(rowData[dateHead]);
      return {
        title: key,
        field: key,
        align: 'left',
        // Hide owner_name
        hidden: key === "owner_name",
        // Make certain fields uneditable
        editable: (isEditable(key, columnObj)),
        // Highlight comments
        cellStyle: key === "comments" ? {
          ...defaultCell, backgroundColor: '#ffffed'
        } : key === 'points_type' ? waxCell : defaultCell,
        render: key === "guild" ? rowData => renderGuildLogo(rowData) : isDate ? rowData => renderDate(rowData) : undefined
      };
    });
    console.log("Table columns generated.");
    return columnsSetup;
  };

  const addItem = (tabletitle) => {
    const typeMap = {
      "Products": "product",
      "Bizdevs": "bizdev",
      "Community": "community"
    }
    const type = typeMap[tabletitle] ? typeMap[tabletitle] : "unknownType";
    const isProdOrBizdev = type === 'product' || type === 'bizdev';
    const isComm = type === 'community';
    const intro = `Add new ${type}. Please enter`;
    const owner_name = prompt(`${intro} guild name: `, "sentnlagents");
    const name = isProdOrBizdev ? prompt(`${intro} name: `, `New ${type}`) : null;
    const description = isProdOrBizdev ? prompt(`${intro} description: `, "") : null;
    const stage = isProdOrBizdev ? prompt(`${intro} stage: `, (type === 'product' ? 'Development' : 'Qualified Lead')) : null;
    const points = isProdOrBizdev ? prompt(`${intro} points: `, "") : null;
    const origcontentpoints = isComm ? prompt(`${intro} origcontentpoints: `, "") : null;
    const transcontentpoints = isComm ? prompt(`${intro} transcontentpoints: `, "") : null;
    const eventpoints = isComm ? prompt(`${intro} eventpoints: `, "") : null;
    const managementpoints = isComm ? prompt(`${intro} managementpoints: `, "") : null;
    const outstandingpoints = isComm ? prompt(`${intro} outstandingpoints: `, "") : null;
    const analytics_url = isProdOrBizdev ? prompt(`${intro} analytics_url: `, "") : null;
    const spec_url = isProdOrBizdev ? prompt(`${intro} spec_url: `, "") : null;
    const code_repo = type === 'product' ? prompt(`${intro} code_repo: `, "") : null;
    const comments = prompt(`${intro} comments (optional): `, "");
    const initialPayload = type !== 'unknownType' ? {
      owner_name,
      name,
      description,
      stage,
      points: +points,
      origcontentpoints: +origcontentpoints,
      transcontentpoints: +transcontentpoints,
      eventpoints: +eventpoints,
      managementpoints: +managementpoints,
      outstandingpoints: +outstandingpoints,
      analytics_url,
      spec_url,
      code_repo,
      comments
    } : {
      'error': 'Payload not set up'
    };
    const payload = JSON.parse(JSON.stringify(initialPayload))
    // Should ideally be an integrated table editor, when we make it pretty
    // eslint-disable-next-line no-restricted-globals
    const itemConfirm = confirm(`Confirm new ${type}: ${Object.keys(payload).map(key => payload[key]).join(' | ')}`);
    if (itemConfirm) {
      const tableCopy = [...tableState];
      const found = tableCopy.map((row, index) => payload.name && row.name === payload.name && row.owner_name === payload.owner_name ? index : !payload.name && payload.owner_name === row.owner_name ? index : -1).filter(row => { return +row >= 0 });
      console.log(`Data will ${!found[0] ? "not" : null} be overwritten.`);
      const finalPayload = {
        ...payload,
        // This gets overwritten, but no worries - it'll be off by seconds at max.
        date_updated: new Date()
      }
      // This code can be made simpler - .push() wasn't the solution to updating state. See https://stackoverflow.com/a/60957646 - material-table doesn't work with hooks
      if (found[0]) {
        tableCopy[found[0]] = finalPayload;
      } else {
        tableCopy.push(finalPayload)
      }
      setTableState(tableCopy);
      console.log("Table state updated!");
      updateDb(finalPayload)
    }
    // Should have an else clause allowing user to edit
  }


  const maxLength = tableState.length >= 20 ? 20 : tableState.length;

  return (
    <div className={classes.root}>
      {tableState.length >= 1 ? <MaterialTable
        columns={generateColumns()}
        className={classes.materialTable}
        options={{
          pageSize: maxLength,
          padding: 'dense'
        }}
        editable={{
          onRowUpdate: (newRow, oldRow) => {
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
              updateDb(payload);
            });
          },
        }}
        // The below code is terrible, but it has to be this way: https://github.com/mbrn/material-table/issues/1900
        data={Array.from(JSON.parse(JSON.stringify(tableState)))} // This is neccessary for some reason. I think it's because material-table doesn't like a mutating state. Oddly, it doesn't matter for the columns above. Perhaps because they don't change?
        title={tabletitle}
      /> : null}
      {tabletitle === "Products" || tabletitle === "Bizdevs" || tabletitle === "Community" ? <Button
        type="submit"
        variant="contained"
        color="primary"
        className={tableState.length >= 1 ? classes.addItemButton : classes.addItemButtonEmpty}
        onClick={e => addItem(tabletitle)}
      >Add new item to "{tabletitle}"</Button> : null}
      {/*<Dialog
        open={popupOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Create new"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Last fetched: {lastfetched}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary">
            Continue
          </Button>
        </DialogActions>
      </Dialog>*/}
    </div>
  );
}
