import { getCurrentViewRange, getFilters, removeFilter } from './utils';

describe('getCurrentViewRange', () => {
  const intl = {
    formatMessage: (name, { fileCount, rowCount }) => (
      `Showing ${fileCount} of ${rowCount}`
    ),
  };

  it('should return with intials row count', () => {
    const data = {
      filterRowCount: 25,
      initialRowCount: 25,
      fileCount: 12,
      intl,
    };
    const expected = 'Showing 12 of 25';
    const actual = getCurrentViewRange(data);

    expect(actual).toEqual(expected);
  });

  it('should return with filter row count', () => {
    const data = {
      filterRowCount: 12,
      initialRowCount: 25,
      fileCount: 12,
      intl,
    };
    const expected = 'Showing 12 of 12';
    const actual = getCurrentViewRange(data);

    expect(actual).toEqual(expected);
  });
});

describe('getFilters', () => {
  it('should return filter object for text search with no filters', () => {
    const state = { filters: [{ id: 'test', value: 'unknown' }] };
    const columns = [];
    const expected = [{ name: 'unknown', value: 'unknown' }];
    const actual = getFilters(state, columns);

    expect(actual).toEqual(expected);
  });

  it('should return filter object for text search with filters', () => {
    const state = { filters: [{ id: 'test', value: ['unknown'] }, { id: 'validColumn', value: ['filter1'] }] };
    const columns = [{
      id: 'validColumn',
      filterChoices: [
        { name: 'Filter 1', value: 'filter1' },
        { name: 'Filter 2', value: 'filter2' },
      ],
    }];
    const expected = [{ name: 'unknown', value: 'unknown' }, { name: 'Filter 1', value: 'filter1' }];
    const actual = getFilters(state, columns);

    expect(actual).toEqual(expected);
  });

  it('should return filter object for no text search with filters', () => {
    const state = { filters: [{ id: 'validColumn', value: ['filter1'] }] };
    const columns = [{
      id: 'validColumn',
      filterChoices: [
        { name: 'Filter 1', value: 'filter1' },
        { name: 'Filter 2', value: 'filter2' },
      ],
    }];
    const expected = [{ name: 'Filter 1', value: 'filter1' }];
    const acutal = getFilters(state, columns);

    expect(acutal).toEqual(expected);
  });
});

describe('removeFilter', () => {
  const setAllFilters = jest.fn();
  const setFilter = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('state filter.value is an array', () => {
    it('should call setAllFilters', () => {
      const state = {
        filters: [
          { id: 'test', value: ['filter1'] },
        ],
      };
      const filter = 'filter1';
      removeFilter(filter, setFilter, setAllFilters, state);

      expect(setAllFilters).toHaveBeenCalled();
    });

    it('should call setFilter', () => {
      const state = {
        filters: [
          { id: 'test', value: ['filter1', 'filter2'] },
        ],
      };
      const filter = 'filter1';
      removeFilter(filter, setFilter, setAllFilters, state);

      expect(setFilter).toHaveBeenCalled();
    });
  });
  describe('state filter.value is not an array', () => {
    it('should call setAllFilters', () => {
      const state = {
        filters: [
          { id: 'test', value: 'filter1' },
        ],
      };
      const filter = 'filter1';
      removeFilter(filter, setFilter, setAllFilters, state);

      expect(setAllFilters).toHaveBeenCalled();
    });
  });
});
