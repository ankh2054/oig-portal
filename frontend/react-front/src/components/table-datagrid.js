import React, { useState } from "react"; 
import MaterialTable from "material-table"; 

export default function App({ tabledata, tabletitle }) { 
  console.log(tabledata, tabletitle)
  const [data, setData] = useState(tabledata);
  //Set object from first object in array 
  const columnObj = !!data[0] ? data[0] : {};
  //Create Columns from keys of object prop
  var columnsSetup = Object.keys(columnObj).map(function(key) {
    return {
        "title":key,
        "field":key
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
                setTimeout(() => {
                  const dataUpdate = [...data];
                  const index = oldData.tableData.id;
                  dataUpdate[index] = newData;
                  setData([...dataUpdate]);
                  resolve();
                }, 1000)
              })
            }}
            data={data}
            title={tabletitle}
          />
       </div> 
     </div> 
   ); 
}