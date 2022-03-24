import StrictDict from './StrictDict';

const keyStore = (collection) => StrictDict(
  Object.keys(collection).reduce(
    (obj, key) => ({ ...obj, [key]: key }),
    {},
  ),
);

export default keyStore;
