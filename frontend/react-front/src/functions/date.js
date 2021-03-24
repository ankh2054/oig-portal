import moment from 'moment'

const datec = (date) => {
    /* var c = new Date(date);
    var e = c.toLocaleTimeString();
    var d = c.toLocaleDateString();
    var finaldate = d + " @ " + e */
    return moment().format(`DD/MM/YY[@]H:mm`)
    // ${'\u00A0'} must be used because nbsp doesn't work
  }

  export default datec