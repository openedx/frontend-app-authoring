import { getCheckedFilters, getFilterOptions, processFilters } from './utils';

describe('getCheckboxFilters', () => {
  describe('switch case locked', () => {
    it('should equal array with string locked', () => {
      const state = {
        filters: [
          { id: 'locked', value: [true] },
        ],
      };
      const expected = ['locked'];
      const actual = getCheckedFilters(state);

      expect(actual).toEqual(expected);
    });

    it('value attribute should equal public', () => {
      const state = {
        filters: [
          { id: 'locked', value: [false] },
        ],
      };
      const expected = ['public'];
      const actual = getCheckedFilters(state);

      expect(actual).toEqual(expected);
    });
  });

  describe('switch case usageLocations', () => {
    it('value attribute should equal active', () => {
      const state = {
        filters: [
          { id: 'usageLocations', value: [true] },
        ],
      };
      const expected = ['active'];
      const actual = getCheckedFilters(state);

      expect(actual).toEqual(expected);
    });

    it('value attribute should equal inactive', () => {
      const state = {
        filters: [
          { id: 'usageLocations', value: [false] },
        ],
      };
      const expected = ['inactive'];
      const actual = getCheckedFilters(state);

      expect(actual).toEqual(expected);
    });
  });

  describe('switch case transcripts', () => {
    it('should equal array with string transcribed', () => {
      const state = {
        filters: [
          { id: 'transcripts', value: [true] },
        ],
      };
      const expected = ['transcribed'];
      const actual = getCheckedFilters(state);

      expect(actual).toEqual(expected);
    });

    it('should equal array with string notTranscribed', () => {
      const state = {
        filters: [
          { id: 'transcripts', value: [false] },
        ],
      };
      const expected = ['notTranscribed'];
      const actual = getCheckedFilters(state);

      expect(actual).toEqual(expected);
    });
  });

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
});

describe('getFilterOptions', () => {
  describe('switch case locked', () => {
    it('value attribute should equal locked', () => {
      const columns = [
        { id: 'locked', filterChoices: [{ name: 'Locked', value: true }] },
      ];
      const expected = [
        { name: 'Locked', value: 'locked' },
      ];
      const actual = getFilterOptions(columns);

      expect(actual).toEqual(expected);
    });

    it('value attribute should equal public', () => {
      const columns = [
        { id: 'locked', filterChoices: [{ name: 'Public', value: false }] },
      ];
      const expected = [
        { name: 'Public', value: 'public' },
      ];
      const actual = getFilterOptions(columns);

      expect(actual).toEqual(expected);
    });
  });

  describe('switch case usageLocation', () => {
    it('value attribute should equal active', () => {
      const columns = [
        { id: 'usageLocations', filterChoices: [{ name: 'Active', value: true }] },
      ];
      const expected = [
        { name: 'Active', value: 'active' },
      ];
      const actual = getFilterOptions(columns);

      expect(actual).toEqual(expected);
    });

    it('value attribute should equal inactive', () => {
      const columns = [
        { id: 'usageLocations', filterChoices: [{ name: 'Inactive', value: false }] },
      ];
      const expected = [
        { name: 'Inactive', value: 'inactive' },
      ];
      const actual = getFilterOptions(columns);

      expect(actual).toEqual(expected);
    });
  });

  describe('switch case transcripts', () => {
    it('value attribute should equal transcribed', () => {
      const columns = [
        { id: 'transcripts', filterChoices: [{ name: 'Transcribed', value: true }] },
      ];
      const expected = [
        { name: 'Transcribed', value: 'transcribed' },
      ];
      const actual = getFilterOptions(columns);

      expect(actual).toEqual(expected);
    });

    it('value attribute should equal notTranscribed', () => {
      const columns = [
        { id: 'transcripts', filterChoices: [{ name: 'Not transcribed', value: false }] },
      ];
      const expected = [
        { name: 'Not transcribed', value: 'notTranscribed' },
      ];
      const actual = getFilterOptions(columns);

      expect(actual).toEqual(expected);
    });
  });

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

  describe('switch case locked', () => {
    it('should call setAllFilters with locked filter', () => {
      const filters = ['locked'];
      const columns = [
        { id: 'locked', filterChoices: [{ name: 'Locked', value: true }, { name: 'Public', value: false }] },
      ];
      const expectedParameter = [{ id: 'locked', value: [true] }];
      processFilters(filters, columns, setAllFilters);

      expect(setAllFilters).toHaveBeenCalledWith(expectedParameter);
    });

    it('should call setAllFilters with public filter', () => {
      const filters = ['public'];
      const columns = [
        { id: 'locked', filterChoices: [{ name: 'Public', value: false }] },
      ];
      const expectedParameter = [{ id: 'locked', value: [false] }];
      processFilters(filters, columns, setAllFilters);

      expect(setAllFilters).toHaveBeenCalledWith(expectedParameter);
    });
  });

  describe('switch case usageLocations', () => {
    it('should call setAllFilters with active filter', () => {
      const filters = ['active'];
      const columns = [
        { id: 'usageLocations', filterChoices: [{ name: 'Active', value: true }] },
      ];
      const expectedParameter = [{ id: 'usageLocations', value: [true] }];
      processFilters(filters, columns, setAllFilters);

      expect(setAllFilters).toHaveBeenCalledWith(expectedParameter);
    });

    it('should call setAllFilters with inactive filter', () => {
      const filters = ['inactive'];
      const columns = [
        { id: 'usageLocations', filterChoices: [{ name: 'Inactive', value: false }] },
      ];
      const expectedParameter = [{ id: 'usageLocations', value: [false] }];
      processFilters(filters, columns, setAllFilters);

      expect(setAllFilters).toHaveBeenCalledWith(expectedParameter);
    });
  });

  describe('switch case transcripts', () => {
    it('should call setAllFilters with transcribed filter', () => {
      const filters = ['transcribed'];
      const columns = [
        { id: 'transcripts', filterChoices: [{ name: 'Transcribed', value: true }] },
      ];
      const expectedParameter = [{ id: 'transcripts', value: [true] }];
      processFilters(filters, columns, setAllFilters);

      expect(setAllFilters).toHaveBeenCalledWith(expectedParameter);
    });

    it('should call setAllFilters with notTranscribed filter', () => {
      const filters = ['notTranscribed'];
      const columns = [
        { id: 'transcripts', filterChoices: [{ name: 'Not transcribed', value: false }] },
      ];
      const expectedParameter = [{ id: 'transcripts', value: [false] }];
      processFilters(filters, columns, setAllFilters);

      expect(setAllFilters).toHaveBeenCalledWith(expectedParameter);
    });
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
});
