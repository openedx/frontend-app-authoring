import { getConfig } from '@edx/frontend-platform';
import { GroupTypes } from 'CourseAuthoring/data/constants';
import { isGroupTypeEnabled } from './utils';

jest.mock('@edx/frontend-platform', () => ({ getConfig: jest.fn() }));

describe('teams utils', () => {
  describe('isGroupTypeEnabled', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test('returns true if the group type is enabled', () => {
      getConfig.mockReturnValue({ ENABLE_OPEN_MANAGED_TEAM_TYPE: false });
      expect(isGroupTypeEnabled(GroupTypes.OPEN)).toBe(true);
      expect(isGroupTypeEnabled(GroupTypes.PUBLIC_MANAGED)).toBe(true);
      expect(isGroupTypeEnabled(GroupTypes.PRIVATE_MANAGED)).toBe(true);
    });
    test('returns false if the OPEN_MANAGED group is not enabled', () => {
      getConfig.mockReturnValue({ ENABLE_OPEN_MANAGED_TEAM_TYPE: false });
      expect(isGroupTypeEnabled(GroupTypes.OPEN_MANAGED)).toBe(false);
    });

    test('returns true if the OPEN_MANAGED group is enabled', () => {
      getConfig.mockReturnValue({ ENABLE_OPEN_MANAGED_TEAM_TYPE: true });
      expect(isGroupTypeEnabled(GroupTypes.OPEN_MANAGED)).toBe(true);
    });

    test('returns false if the group is invalid', () => {
      getConfig.mockReturnValue({ ENABLE_OPEN_MANAGED_TEAM_TYPE: true });
      expect(isGroupTypeEnabled('FOO')).toBe(false);
    });

    test('returns false if the group is null', () => {
      getConfig.mockReturnValue({ ENABLE_OPEN_MANAGED_TEAM_TYPE: true });
      expect(isGroupTypeEnabled(null)).toBe(false);
    });
  });
});
