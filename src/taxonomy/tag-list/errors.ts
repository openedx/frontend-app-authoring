/** Custom error classes for the Tag List feature. */
/* eslint-disable max-classes-per-file */

export class TagTreeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TagTreeError';
  }
}

export class TagListTableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TagListTableError';
  }
}
