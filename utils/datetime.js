module.exports = {
  DBNowString: () => {
    const now = new Date();
    return `${now.getFullYear()}/${now.getMonth()}/${now.getDate()} ${now.toTimeString()}`;
  },
  FormatString: (dateString) => {
    const datetime = new Date(dateString);
    return `${datetime.getHours}:${datetime.getMinutes} ${datetime.getDate()}/${datetime.getMonth()}/${datetime.getFullYear()}`
  }
}