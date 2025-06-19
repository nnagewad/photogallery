import { DateTime } from "luxon";

export default value => {
  let date = value;
  const dateTime = DateTime.fromFormat(date, "yyyy:MM:dd HH:mm:ss", { zone: "local" });
  return dateTime.toUTC().toISO();
}