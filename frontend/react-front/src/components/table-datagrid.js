import React, { useState } from "react"; 
import MaterialTable from "material-table"; 

export default function App({ tabledata, tabletitle }) { 
  console.log(tabledata, tabletitle) // Function is called twice
  const [data, setData] = useState(tabledata);
  //Set object from first object in array 
  const columnObj = !!data[0] ? data[0] : {};
  //Create Columns from keys of object prop
  var columnsSetup = Object.keys(columnObj).map(function(key) {
    return {
        "title":key,
        "field":key,
        // Hide owner_name
        "hidden": key === "owner_name"
    }
  });
   return ( 
      <div className="App"> 
        <div style={{ maxWidth: "100%" }}>
          <MaterialTable 
            columns={columnsSetup}
          editable={{
            onRowUpdate: (newData, oldData) =>
              new Promise((resolve, reject) => {
                const dataUpdate = [...data];
                const index = oldData.tableData.id;
                dataUpdate[index] = newData;
                console.log("data to update");
                console.log(dataUpdate[index])
                setData([...dataUpdate]);
                resolve();
              })
            }}
            data={data}
            title={tabletitle}
          />
       </div> 
     </div> 
   ); 
}