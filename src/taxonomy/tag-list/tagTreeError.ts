export default class TagTreeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TagTreeError';
  }
}
