/* eslint-disable no-console */
const strictGet = (target, name) => {
  if (name === Symbol.toStringTag) {
    return target;
  }

  // '@@toStringTag' is used by propTypes in its internal `isSymbol()` function.
  // We can probably remove this exception once we get rid of propTypes.
  if (name in target || name === '_reactFragment' || name === '@@toStringTag') {
    return target[name];
  }

  if (name === '$$typeof') {
    return typeof target;
  }

  console.log(name.toString());
  console.error({ target, name });
  const e = Error(`invalid property "${name.toString()}"`);
  console.error(e.stack);
  return undefined;
};

const StrictDict = <T extends Record<string, any>>(dict: T) => new Proxy(dict, { get: strictGet }) as T;

export default StrictDict;
