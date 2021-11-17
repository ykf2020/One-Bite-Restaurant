const pad = (v) => {
  return (v < 10) ? '0' + v : v
}
const getDateString = (d) => {
  let year = d.getFullYear()
  let month = pad(d.getMonth() + 1)
  let day = pad(d.getDate())
  let hour = pad(d.getHours())
  let min = pad(d.getMinutes())
  let sec = pad(d.getSeconds())

  return year + "/" + month + "/" + day + " " + hour + ":" + min + ":" + sec
}

module.exports = getDateString
