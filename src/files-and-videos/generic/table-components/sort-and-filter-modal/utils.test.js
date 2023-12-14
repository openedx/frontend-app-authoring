import { getCheckedFilters, getFilterOptions, processFilters } from './utils';

describe('getCheckboxFilters', () => {
  describe('switch case default', () => {
    it('should equal array with string test', () => {
      const state = {
        filters: [
          { id: 'testId', value: ['testValue'] },
        ],
      };
      const expected = ['testValue'];
      const actual = getCheckedFilters(state);

      expect(actual).toEqual(expected);
    });
  });

  describe('filter with serach bar', () => {
    it('should equal array in array with displayName and value', () => {
      const state = {
        filters: [{ id: 'displayName', value: 'filter' }],
      };
      const expected = [['displayName', 'filter']];
      const actual = getCheckedFilters(state);

      expect(actual).toEqual(expected);
    });
  });
});

describe('getFilterOptions', () => {
  describe('switch case default', () => {
    it('value attribute should equal test', () => {
      const columns = [
        { id: 'other', filterChoices: [{ name: 'Test', value: 'test' }] },
      ];
      const expected = [
        { name: 'Test', value: 'test' },
      ];
      const actual = getFilterOptions(columns);

      expect(actual).toEqual(expected);
    });
  });
});

describe('processFilters', () => {
  const setAllFilters = jest.fn();
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should call setAllFilters with an empty array', () => {
    const filters = [];
    const columns = [
      { id: 'locked', filterChoices: [{ name: 'Locked', value: true }] },
    ];
    const expectedParameter = [];
    processFilters(filters, columns, setAllFilters);

    expect(setAllFilters).toHaveBeenCalledWith(expectedParameter);
  });

  describe('switch case default', () => {
    it('should call setAllFilters with test filter', () => {
      const filters = ['filter'];
      const columns = [
        { id: 'test', filterChoices: [{ name: 'Filter', value: 'filter' }] },
      ];
      const expectedParameter = [{ id: 'test', value: ['filter'] }];
      processFilters(filters, columns, setAllFilters);

      expect(setAllFilters).toHaveBeenCalledWith(expectedParameter);
    });
  });

  describe('filter with serach bar', () => {
    it('should call setAllFitlers with displayName filter', () => {
      const filters = [['displayName', 'search']];
      const columns = [
        { id: 'test', filterChoices: [{ name: 'Filter', value: 'filter' }] },
      ];
      const expectedParameter = [{ id: 'displayName', value: ['search'] }];
      processFilters(filters, columns, setAllFilters);

      expect(setAllFilters).toHaveBeenCalledWith(expectedParameter);
    });
  });
});
