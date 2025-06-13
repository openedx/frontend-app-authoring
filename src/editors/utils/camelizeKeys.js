// @ts-check
import camelCase from 'lodash/camelCase';

const camelizeKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => camelizeKeys(v));
  }
  if (obj != null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({ ...result, [camelCase(key)]: camelizeKeys(obj[key]) }),
      {},
    );
  }
  return obj;
};
export default camelizeKeys;
