import { LOADING_STATUS } from '../../common';
import { getMainMenuDropdown, getOutlineLink } from '../utils';

describe('studio header wrapper utils', () => {
  describe('getOutlineLink', () => {
    it('should return /library/:libraryId', () => {
      const libraryId = 'testId';
      const loadingStatus = LOADING_STATUS.LOADED;
      const expected = `/library/${libraryId}`;
      const actual = getOutlineLink(loadingStatus, libraryId);
      expect(expected).toEqual(actual);
    });
    it('should return #', () => {
      const libraryId = 'testId';
      const loadingStatus = LOADING_STATUS.STANDBY;
      const expected = '#';
      const actual = getOutlineLink(loadingStatus, libraryId);
      expect(expected).toEqual(actual);
    });
  });
  describe('getMainMenuDropdown', () => {
    it('should return an array of length 1', () => {
      const libraryId = 'testId';
      const loadingStatus = LOADING_STATUS.LOADED;
      const dropdownArray = getMainMenuDropdown(loadingStatus, libraryId, { formatMessage: jest.fn() });
      expect(dropdownArray).toHaveLength(1);
    });
    it('should return an empty array', () => {
      const libraryId = 'testId';
      const loadingStatus = LOADING_STATUS.LOADING;
      const dropdownArray = getMainMenuDropdown(loadingStatus, libraryId, { formatMessage: jest.fn() });
      expect(dropdownArray).toHaveLength(0);
    });
  });
});
