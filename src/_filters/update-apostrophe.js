export default (title) => {
  const updatedTitle = title
    .replace(/(')+?/, "’")
  return updatedTitle;
}