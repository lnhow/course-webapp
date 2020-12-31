module.exports = {
  ISODateNow: () => {
    return (new Date()).toISOString();
  },
  //Format ISO date string to hh:mm dd:MM:YYYY
  FormatDate: (dateString) => {
    const datetime = new Date(dateString);
    return ('0' + datetime.getHours()).slice(-2)
      + ':' + ('0' + datetime.getMinutes()).slice(-2)
      + ' ' + ('0' + datetime.getDate()).slice(-2) 
      + '/' + ('0' +  (datetime.getMonth() + 1)).slice(-2)
      + '/' + datetime.getFullYear();
  }
}