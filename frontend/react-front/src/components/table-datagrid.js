import React, { useState } from "react";
import MaterialTable from "material-table";
import { makeStyles } from '@material-ui/core/styles';
import datec from '../functions/date'
import updateTableState from './update-table-state'
import AddNewDialog from "./add-new-dialog";

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'inline-block',
    width: '100%'
  },
  noTable: {
    marginBottom: '25px'
  },
  materialTable: {
    margin: '25px auto',
    maxWidth: '1200px'
  }
}))

export default function Table({ tabledata, tabletitle, defaultOwner, isAdmin }) {
  const classes = useStyles();
  const [tableState, setTableState] = useState(tabledata);

  const typeMap = {
    "Products": "product",
    "Bizdevs": "bizdev",
    "Community": "community"
  }
  const type = typeMap[tabletitle] ? typeMap[tabletitle] : "unknownType";

  const defaultCell = {
    //whiteSpace: 'nowrap'
  }

  const waxCell = {
    ...defaultCell,
    color: '#332b1f',
    background: 'linear-gradient(90.08deg, rgb(247, 142, 30), rgb(255, 220, 81) 236.03%)',
  }

  const isEditable = (key, columnObj) => {
    if (!isAdmin) {
      return 'never'
    }
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

  /* This function is called when table state is updated. Ideally it should not be, as columns aren't supposed to change. */
  const generateColumns = () => {
    // Set object from first object in array
    const columnObj = !!tableState[0] ? tableState[0] : {};
    // Create Columns from keys of object prop
    const columnsSetup = Object.keys(columnObj).map(function (key) {
      // Not sure if this will work for multiple types of items?
      const renderGuildLogo = (rowData) => <a href={'/guilds/' + rowData.owner_name} alt={rowData.owner_name}><img src={rowData.guild} alt={rowData.owner_name} /* Smart use of `style`*/ style={{ width: 50, borderRadius: '50%' }} /></a>;
      const isDate = key === 'date_updated' || key === 'date_check' || key === 'snapshot_date';
      const dateHead = isDate ? key : null;
      const renderDate = (rowData) => datec(rowData[dateHead]);
      return {
        title: key,
        field: key,
        align: 'left',
        // Hide owner_name
        hidden: key === "owner_name" || (key === "comments" && !isAdmin),
        // Make certain fields uneditable
        editable: (isEditable(key, columnObj)),
        // Highlight comments
        cellStyle: key === "comments" ? {
          ...defaultCell, backgroundColor: '#ffffed',
        } : key === 'points_type' ? waxCell : defaultCell,
        render: key === "guild" ? rowData => renderGuildLogo(rowData) : isDate ? rowData => renderDate(rowData) : undefined
      };
    });
    console.log("Table columns generated.");
    return columnsSetup;
  };

  const maxLength = tableState.length >= 20 ? 20 : tableState.length;
  // Throws a warning when length is out of available bounds

  return (
    <div className={tableState.length >= 1 ? classes.root : [classes.root, classes.noTable]}>
      {tableState.length >= 1 ? <MaterialTable
        columns={generateColumns()}
        className={classes.materialTable}
        options={{
          pageSize: maxLength,
          padding: 'dense'
        }}
        actions={isAdmin && type !== 'unknownType' && tabletitle !== 'Point System' ? [
          (rowData) => { // Only show delete for product, biz, and comm
            return {
              icon: 'delete',
              tooltip: 'Delete ' + type,
              onClick: (event, rowData) => {
                alert('Delete functionality TBA')
              }
            }
          },
          (rowData) => { // Same with refresh points - though we may want to add this to tech results?
            return {
              icon: 'refresh',
              tooltip: 'Recalculate Points',
              onClick: (event, rowData) => {
                alert('Recalculate functionality TBA')
              }
            }
          }
        ] : null}
        editable={isAdmin ? { // Show only for admins
          onRowUpdate: (newRow, oldRow) => updateTableState(newRow, oldRow, type, tabletitle, tableState, setTableState),
        } : false}
        // The below code is terrible, but it has to be this way: https://github.com/mbrn/material-table/issues/1900
        data={Array.from(JSON.parse(JSON.stringify(tableState)))} // This is neccessary for some reason. I think it's because material-table doesn't like a mutating state. Oddly, it doesn't matter for the columns above. Perhaps because they don't change?
        title={tabletitle}
      /> : null}
      <AddNewDialog type={type} tableState={tableState} setTableState={setTableState} defaultOwner={defaultOwner} isAdmin={isAdmin} />
    </div>
  );
}
