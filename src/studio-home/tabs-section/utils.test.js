import { sortAlphabeticallyArray } from './utils';

const testData = [
  { displayName: 'Apple' },
  { displayName: 'Orange' },
  { displayName: 'Banana' },
];

describe('sortAlphabeticallyArray', () => {
  it('sortAlphabeticallyArray sorts array alphabetically', () => {
    const sortedData = sortAlphabeticallyArray(testData);

    expect(sortedData).toEqual([
      { displayName: 'Apple' },
      { displayName: 'Banana' },
      { displayName: 'Orange' },
    ]);
  });

  it('sortAlphabeticallyArray does not mutate the original array', () => {
    const originalData = [...testData];
    sortAlphabeticallyArray(testData);

    expect(testData).toEqual(originalData);
  });
});
