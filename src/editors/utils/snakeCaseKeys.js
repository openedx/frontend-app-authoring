import { snakeCase } from 'lodash';

const snakeCaseKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => snakeCaseKeys(v));
  }
  if (obj != null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({ ...result, [snakeCase(key)]: snakeCaseKeys(obj[key]) }),
      {},
    );
  }
  return obj;
};
export default snakeCaseKeys;
