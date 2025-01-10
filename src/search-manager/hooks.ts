import React from 'react';
import {
  type FromStringFn,
  type ToStringFn,
  useStateWithUrlSearchParam,
} from '../hooks';

/**
 * Typed hook that returns useState if skipUrlUpdate,
 * or useStateWithUrlSearchParam otherwise.
 *
 * Function is overloaded to accept simple Type or Type[] values.
 *
 * Provided here to reduce some code overhead in SearchManager.
 */
export function useStateOrUrlSearchParam<Type>(
  defaultValue: Type[],
  paramName: string,
  fromString: FromStringFn<Type>,
  toString: ToStringFn<Type>,
  skipUrlUpdate?: boolean,
): [value: Type[], setter: React.Dispatch<React.SetStateAction<Type[]>>];
export function useStateOrUrlSearchParam<Type>(
  defaultValue: Type,
  paramName: string,
  fromString: FromStringFn<Type>,
  toString: ToStringFn<Type>,
  skipUrlUpdate?: boolean,
): [value: Type, setter: React.Dispatch<React.SetStateAction<Type>>];
export function useStateOrUrlSearchParam<Type>(
  defaultValue: Type | Type[],
  paramName: string,
  fromString: FromStringFn<Type>,
  toString: ToStringFn<Type>,
  skipUrlUpdate?: boolean,
): [value: Type | Type[], setter: React.Dispatch<React.SetStateAction<Type | Type[]>>] {
  const useStateManager = React.useState<typeof defaultValue>(defaultValue);
  const urlStateManager = useStateWithUrlSearchParam<typeof defaultValue>(
    defaultValue,
    paramName,
    fromString,
    toString,
  );

  return skipUrlUpdate ? useStateManager : urlStateManager;
}

/**
 * Helper class for managing Block + Problem type states.
 *
 * We use a class to store both Block and Problem types together because
 * their behaviour is tightly intertwined: e.g if Block type "problem" is
 * selected, that means all available Problem types are also selected.
 *
 */
export class TypesFilterData {
  #blocks = new Set<string>();

  #problems = new Set<string>();

  static #sanitizeType = (value: string | null | undefined): string | undefined => (
    (value && /^[a-z0-9._-]+$/.test(value))
      ? value
      : undefined
  );

  static #sep1 = ','; // separates the individual types

  static #sep2 = '|'; // separates the block types from the problem types

  // Constructs a TypesFilterData from a string as generated from toString().
  constructor(value?: string | null) {
    const [blocks, problems] = (value || '').split(TypesFilterData.#sep2);
    this.union({ blocks, problems });
  }

  // Serialize the TypesFilterData to a string, or undefined if isEmpty().
  toString(): string | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    return [
      [...this.#blocks].join(TypesFilterData.#sep1),
      [...this.#problems].join(TypesFilterData.#sep1),
    ].join(TypesFilterData.#sep2);
  }

  // Returns true if there are no block or problem types.
  isEmpty(): boolean {
    return !(this.#blocks.size || this.#problems.size);
  }

  get blocks() : Set<string> {
    return this.#blocks;
  }

  get problems(): Set<string> {
    return this.#problems;
  }

  clear(): TypesFilterData {
    this.#blocks.clear();
    this.#problems.clear();
    return this;
  }

  union({ blocks, problems }: {
    blocks?: string[] | Set<string> | string | undefined,
    problems?: string[] | Set<string> | string | undefined,
  }): void {
    let newBlocks: string[];
    if (!blocks) {
      newBlocks = [];
    } else if (typeof blocks === 'string') {
      newBlocks = blocks.split(TypesFilterData.#sep1) || [];
    } else {
      newBlocks = [...blocks];
    }
    newBlocks = newBlocks.filter(TypesFilterData.#sanitizeType);
    this.#blocks = new Set<string>([...this.#blocks, ...newBlocks]);

    let newProblems: string[];
    if (!problems) {
      newProblems = [];
    } else if (typeof problems === 'string') {
      newProblems = problems.split(TypesFilterData.#sep1) || [];
    } else {
      newProblems = [...problems];
    }
    newProblems = newProblems.filter(TypesFilterData.#sanitizeType);
    this.#problems = new Set<string>([...this.#problems, ...newProblems]);
  }
}
