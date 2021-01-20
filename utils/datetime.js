module.exports = {
  ISODateNow: () => {
    return (new Date()).toISOString();
  },
  //Format ISO date string to hh:mm dd:MM:YYYY
  FormatDate: (dateString) => {
    let datetime = new Date(dateString);
    const offset = 7; //Time offset from the server time
    datetime.setTime(datetime.getTime() + offset*60*60*1000);
    
    return ('0' + datetime.getHours()).slice(-2)
      + ':' + ('0' + datetime.getMinutes()).slice(-2)
      + ' ' + ('0' + datetime.getDate()).slice(-2) 
      + '/' + ('0' +  (datetime.getMonth() + 1)).slice(-2)
      + '/' + datetime.getFullYear();
  }
}