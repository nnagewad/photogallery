export function getLinkActiveState(itemUrl, pageUrl) {
  let response = '';

  if (itemUrl === pageUrl) {
    response = ' aria-current="page"';
  }

  if (itemUrl.length > 1 && pageUrl.indexOf(itemUrl) === 0) {
    response += ' data-state="active"';
  }

  return response;
}
export const builtAtString = new Date().toUTCString();
export const builtAtISO = new Date().toISOString();