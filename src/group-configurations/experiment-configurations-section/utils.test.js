import {
  allGroupNamesAreUnique,
  getNextGroupName,
  getGroupPercentage,
} from './utils';

describe('utils module', () => {
  describe('getNextGroupName', () => {
    it('return correct next group name test-case-1', () => {
      const groups = [
        {
          name: 'Group A',
        },
        {
          name: 'Group B',
        },
      ];
      const nextGroup = getNextGroupName(groups);
      expect(nextGroup.name).toBe('Group C');
    });

    it('return correct next group name test-case-2', () => {
      const groups = [];
      const nextGroup = getNextGroupName(groups);
      expect(nextGroup.name).toBe('Group A');
    });

    it('return correct next group name test-case-3', () => {
      const groups = [
        {
          name: 'Some group',
        },
      ];
      const nextGroup = getNextGroupName(groups);
      expect(nextGroup.name).toBe('Group B');
    });

    it('return correct next group name test-case-4', () => {
      const groups = [
        {
          name: 'Group A',
        },
        {
          name: 'Group A',
        },
      ];
      const nextGroup = getNextGroupName(groups);
      expect(nextGroup.name).toBe('Group C');
    });

    it('return correct next group name test-case-5', () => {
      const groups = [
        {
          name: 'Group A',
        },
        {
          name: 'Group C',
        },
        {
          name: 'Group B',
        },
      ];
      const nextGroup = getNextGroupName(groups);
      expect(nextGroup.name).toBe('Group D');
    });

    it('return correct next group name test-case-6', () => {
      const groups = [
        {
          name: '',
        },
        {
          name: '',
        },
      ];
      const nextGroup = getNextGroupName(groups);
      expect(nextGroup.name).toBe('Group C');
    });

    it('return correct next group name test-case-7', () => {
      const groups = [
        {
          name: 'Group A',
        },
        {
          name: 'Group C',
        },
      ];
      const nextGroup = getNextGroupName(groups);
      expect(nextGroup.name).toBe('Group D');
    });

    it('return correct next group name test-case-8', () => {
      const groups = [
        {
          name: 'Group D',
        },
      ];
      const nextGroup = getNextGroupName(groups);
      expect(nextGroup.name).toBe('Group B');
    });

    it('return correct next group name test-case-9', () => {
      const simulatedGroupWithAlphabetLength = Array.from(
        { length: 26 },
        () => ({ name: 'Test name' }),
      );
      const nextGroup = getNextGroupName(simulatedGroupWithAlphabetLength);
      expect(nextGroup.name).toBe('Group AA');
    });

    it('return correct next group name test-case-10', () => {
      const simulatedGroupWithAlphabetLength = Array.from(
        { length: 702 },
        () => ({ name: 'Test name' }),
      );
      const nextGroup = getNextGroupName(simulatedGroupWithAlphabetLength);
      expect(nextGroup.name).toBe('Group AAA');
    });
  });

  describe('getGroupPercentage', () => {
    it('calculates group percentage correctly', () => {
      expect(getGroupPercentage(1)).toBe('100%');
      expect(getGroupPercentage(7)).toBe('14%');
      expect(getGroupPercentage(10)).toBe('10%');
      expect(getGroupPercentage(26)).toBe('3%');
      expect(getGroupPercentage(100)).toBe('1%');
    });
  });

  describe('allGroupNamesAreUnique', () => {
    it('returns true if all group names are unique', () => {
      const groups = [{ name: 'A' }, { name: 'B' }, { name: 'C' }];
      expect(allGroupNamesAreUnique(groups)).toBe(true);
    });

    it('returns false if any group names are not unique', () => {
      const groups = [{ name: 'A' }, { name: 'B' }, { name: 'A' }];
      expect(allGroupNamesAreUnique(groups)).toBe(false);
    });
  });
});
