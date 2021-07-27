const filterItemFromObject = (array, key, value) => (
  array.filter(item => item[key] !== value)
);

export default filterItemFromObject;
