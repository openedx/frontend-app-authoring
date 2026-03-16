/** Utility type: makes one field required */
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

export type ValueOf<T> = T[keyof T];

/** Utility type: makes K required when Cond is true */
export type RequireIf<Obj, K extends keyof Obj, Cond extends boolean> =
  Cond extends true
    ? Obj & Required<Pick<Obj, K>>
    : Obj;
