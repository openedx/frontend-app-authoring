/** Append items and makes sure the items are unique. */
const uniqueItems = (sourceArray, items = []) => (
  [...new Set([...sourceArray, ...items])]
);

export default uniqueItems;
