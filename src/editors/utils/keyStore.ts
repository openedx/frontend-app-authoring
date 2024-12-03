import StrictDict from './StrictDict';

const keyStore = <Obj extends Record<string, any>>(collection: Obj): { [K in keyof Obj]: K } => StrictDict(
  Object.keys(collection).reduce(
    (obj, key) => ({ ...obj, [key]: key }),
    {},
  ),
) as any;

export default keyStore;
