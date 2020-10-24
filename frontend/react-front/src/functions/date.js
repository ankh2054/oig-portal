const datec = (date) => {
    var c = new Date(date);
    var e = c.toLocaleTimeString();
    var d = c.toLocaleDateString();
    var finaldate = d
    return finaldate
  }

  export default datec