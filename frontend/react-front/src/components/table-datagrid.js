import React, { useState } from "react";
import MaterialTable from "material-table";
import { api_base } from "../config";
import axios from "axios";

export default function Table({ tabledata, tabletitle }) {
  const [tableState, setTableState] = useState(tabledata);

  // Update row in database - now generic
  const updateDb = (newRow) => {
    if (tabletitle === "Products") {
      const {
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
      } = newRow;
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
        score,
        points,
        date_updated,
        comments
      } = newRow;
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
        score,
        date_updated,
        comments
      } = newRow;
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
      } = newRow;
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
      } = newRow;
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
      // Otherwise for community, product, bizdev, all should be editable except score and name.
      return (key !== "name" && key !== "score" && key !== "guild" ? "always" : "never")
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
        render: key === "guild" ? rowData => <a href={'/guilds/' + rowData.owner_name} alt={rowData.owner_name}><img src={rowData.guild} alt={rowData.owner_name} style={{ width: 50, borderRadius: '50%' }} /></a> : undefined
      };
    });
    console.log("Table columns generated.");
    return columnsSetup;
  };

  const maxLength = tableState.length >= 20 ? 20 : tableState.length;

  return (
    <MaterialTable
      columns={generateColumns()}
      style={{ margin: '25px 0 50px', maxWidth: '1200px' }}
      options={{
        pageSize: maxLength,
        padding: 'dense'
      }}
      editable={{
        onRowUpdate: (newRow, oldRow) => {
          return new Promise((resolve, reject) => {
            try {
              const tableCopy = [...tableState];
              const index = oldRow.tableData.id;
              tableCopy[index] = newRow;
              setTableState(tableCopy);
              console.log("Table state updated!");
              resolve(newRow);
            } catch (err) {
              // This doesn't do anything and it's uncatched, but should be here so...
              reject(err);
            }
          }).then((newRow) => {
            // Update database after state updated. Arguably this should be done the other way around.
            updateDb(newRow);
          });
        },
      }}
      data={JSON.parse(JSON.stringify(tableState))} // This is neccessary for some reason. I think it's because material-table doesn't like a mutating state. Oddly, it doesn't matter for the columns above. Perhaps because they don't change?
      title={tabletitle}
    />
  );
}
