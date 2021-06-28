const uniqueItems = (sourceArray, items = []) => (
  [...new Set([...sourceArray, ...items])]
);

export default uniqueItems;
