import { sortFunctions } from './utils';

describe('VideGallery utils', () => {
  describe('sortFunctions', () => {
    const dateA = {
      dateAdded: new Date('2023-03-30'),
    };
    const dateB = {
      dateAdded: new Date('2023-03-31'),
    };
    const nameA = {
      displayName: 'This is the Name A',
      dateAdded: new Date('2023-03-30'),
    };
    const nameB = {
      displayName: 'Hello World',
      dateAdded: new Date('2023-03-30'),
    };
    const nameC = {
      displayName: 'Hello World',
      dateAdded: new Date('2023-03-31'),
    };
    const durationA = {
      duration: 10,
    };
    const durationB = {
      duration: 100,
    };
    test('correct functionality of dateNewest', () => {
      expect(sortFunctions.dateNewest(dateA, dateB)).toBeGreaterThan(0);
      expect(sortFunctions.dateNewest(dateB, dateA)).toBeLessThan(0);
      expect(sortFunctions.dateNewest(dateA, dateA)).toEqual(0);
    });
    test('correct functionality of dateOldest', () => {
      expect(sortFunctions.dateOldest(dateA, dateB)).toBeLessThan(0);
      expect(sortFunctions.dateOldest(dateB, dateA)).toBeGreaterThan(0);
      expect(sortFunctions.dateOldest(dateA, dateA)).toEqual(0);
    });
    test('correct functionality of nameAscending', () => {
      expect(sortFunctions.nameAscending(nameA, nameB)).toEqual(1);
      expect(sortFunctions.nameAscending(nameB, nameA)).toEqual(-1);
      expect(sortFunctions.nameAscending(nameA, nameA)).toEqual(0);
      expect(sortFunctions.nameAscending(nameB, nameC)).toBeGreaterThan(0);
    });
    test('correct functionality of nameDescending', () => {
      expect(sortFunctions.nameDescending(nameA, nameB)).toEqual(-1);
      expect(sortFunctions.nameDescending(nameB, nameA)).toEqual(1);
      expect(sortFunctions.nameDescending(nameA, nameA)).toEqual(0);
      expect(sortFunctions.nameDescending(nameB, nameC)).toBeGreaterThan(0);
    });
    test('correct functionality of durationShortest', () => {
      expect(sortFunctions.durationShortest(durationA, durationB)).toBeLessThan(0);
      expect(sortFunctions.durationShortest(durationB, durationA)).toBeGreaterThan(0);
      expect(sortFunctions.durationShortest(durationA, durationA)).toEqual(0);
    });
    test('correct functionality of durationLongest', () => {
      expect(sortFunctions.durationLongest(durationA, durationB)).toBeGreaterThan(0);
      expect(sortFunctions.durationLongest(durationB, durationA)).toBeLessThan(0);
      expect(sortFunctions.durationLongest(durationA, durationA)).toEqual(0);
    });
  });
});
