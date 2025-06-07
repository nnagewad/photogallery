import { DateTime } from "luxon";

export default value => {
  let date = value;
  const dateTime = DateTime.fromFormat(date, "yyyy:MM:dd HH:mm:ss");
  return dateTime.toLocaleString(DateTime.TIME_SIMPLE);
}