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
      } = newRow;
      axios.post(api_base+'/api/productUpdate', { owner_name, name, description, stage, analytics_url, spec_url, code_repo, score, points, date_updated }).then(() => {
        console.log(`Product '${name}' by ${owner_name} updated! Reload to confirm.`)
      })
    } else {
      console.log(`Unknown table type "${tabletitle}"...`)
    }
  };

  /* console.log(tabledata, tabletitle) 
  Function is called twice on normal load, and up to 4 times on a product update. Possible optimisation? 
  */

  /* This function is called when table state is updated. Ideally it should not be, as columns aren't supposed to change. */
  const generateColumns = () => {
    // Set object from first object in array
    const columnObj = !!tableState[0] ? tableState[0] : {};
    // Create Columns from keys of object prop
    const columnsSetup = Object.keys(columnObj).map(function (key) {
      return {
        title: key,
        field: key,
        // Hide owner_name
        hidden: key === "owner_name",
        // Make product name uneditable
        editable: key !== "name" ? "always" : "never",
      };
    });
    console.log("Table columns generated.")
    return columnsSetup;
  };

  return (
    <div className="Table">
      <div style={{ maxWidth: "100%" }}>
        <MaterialTable
          columns={generateColumns()}
          editable={{
            onRowUpdate: (newRow, oldRow) => {
              return new Promise((resolve, reject) => {
                try {
                  const tableCopy = [...tableState];
                  const index = oldRow.tableData.id;
                  tableCopy[index] = newRow;
                  setTableState(tableCopy)
                  console.log("Table state updated!")
                  resolve(newRow);
                } catch (err) {
                  // This doesn't do anything and it's uncatched, but should be here so...
                  reject(err);
                }
              }).then(newRow => {
                // Update database after state updated. Arguably this should be done the other way around.
                updateDb(newRow);
              });
            },
          }}
          data={JSON.parse(JSON.stringify(tableState))} // This is neccessary for some reason. I think it's because material-table doesn't like a mutating state. Oddly, it doesn't matter for the columns above. Perhaps because they don't change?
          title={tabletitle}
        />
      </div>
    </div>
  );
}
