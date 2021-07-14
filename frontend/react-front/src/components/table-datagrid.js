import React, { useState } from "react";
import MaterialTable from "material-table";
import { makeStyles } from '@material-ui/core/styles';
import datec from '../functions/date'
import tryUpdateTable from './try-update-table'
import AddNewDialog from "./add-new-dialog";

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'inline-block',
    width: '100%',
    margin: '5px auto'
  },
  noTable: {
    marginBottom: '25px'
  },
  materialTable: {
    maxWidth: '1200px'
  },
  guildLink: {
    fontWeight: 'bold',
    textDecoration: 'none',
    color: 'rgb(247, 142, 30)',
    '&:hover': {
      textDecoration: 'none'
    }
  }
}))

export default function Table({ tableData, tableTitle, defaultGuild, isAdmin, pointSystem, activeGuilds }) {
  const classes = useStyles();
  const [tableState, setTableState] = useState(tableData);

  const typeMap = {
    "Products": "product",
    "Bizdevs": "bizdev",
    "Community": "community"
  }
  const type = typeMap[tableTitle] ? typeMap[tableTitle] : "unknownType";

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
      const renderGuildLogo = (rowData) => <a href={'/guilds/' + rowData.owner_name} alt={rowData.owner_name} className={classes.guildLink}><img src={rowData.guild} alt={rowData.owner_name} /* Smart use of `style`*/ style={{ width: 50, borderRadius: '50%' }} /></a>;
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

  return (
    <div className={tableState.length >= 1 ? classes.root : [classes.root, classes.noTable]}>
      {tableState.length >= 1 ? <MaterialTable
        columns={generateColumns()}
        className={classes.materialTable}
        options={{
          pageSize: tableState.length >= 20 ? 20 : tableState.length,
          // Cannot be dynamically changed: https://github.com/mbrn/material-table/issues/1480
          pageSizeOptions: [
            (parseInt(tableState.length/4) <= 5 ? tableState.length : parseInt(tableState.length/8)), (parseInt(tableState.length/4) <= 10 ? 10 : parseInt(tableState.length/4)), (parseInt(tableState.length/4) <= 20 ? 20 : parseInt(tableState.length/2))
          ],
          padding: 'dense'
        }}
        actions={isAdmin && type !== 'unknownType' && tableTitle !== 'Point System' ? [
          { // Only show recalc points for product, biz, and comm - though we may want to add this to tech results?
            icon: 'refresh',
            tooltip: 'Recalculate Score',
            onClick: (event, currentRow) => tryUpdateTable('recalc', currentRow, tableTitle, tableState, setTableState, type, pointSystem)
          }
        ] : null}
        editable={isAdmin && type !== 'unknownType' ? { // Show only for admins
          onRowUpdate: (newRow, currentRow) => tryUpdateTable('update', currentRow, tableTitle, tableState, setTableState, type, pointSystem, newRow),
          onRowDelete: (currentRow) => tryUpdateTable('delete', currentRow, tableTitle, tableState, setTableState, type),
        } : isAdmin ? { // No delete for snapshot tech results or point system
          onRowUpdate: (newRow, currentRow) => tryUpdateTable('update', currentRow, tableTitle, tableState, setTableState, type, pointSystem, newRow)
        } : false}
        // The below code is terrible, but it has to be this way: https://github.com/mbrn/material-table/issues/1900
        data={Array.from(JSON.parse(JSON.stringify(tableState)))} // This is neccessary for some reason. I think it's because material-table doesn't like a mutating state. Oddly, it doesn't matter for the columns above. Perhaps because they don't change?
        title={tableTitle}
      /> : null}
      <AddNewDialog type={type} tableState={tableState} tryUpdateTable={tryUpdateTable} setTableState={setTableState} defaultGuild={defaultGuild} isAdmin={isAdmin} pointSystem={pointSystem} />
    </div>
  );
}
