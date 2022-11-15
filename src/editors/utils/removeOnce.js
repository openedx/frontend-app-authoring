const removeItemOnce = (arr, value) => {
  // create a deep copy as array.splice doesn't work if the array has been dereferenced.
  // structuredClone works in node >11, and we are on node 16.
  // eslint-disable-next-line
  const deepCopy = structuredClone(arr);
  const index = deepCopy.indexOf(value);
  if (index > -1) {
    deepCopy.splice(index, 1);
  }
  return deepCopy;
};

export default removeItemOnce;
