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
          name: 'Group A', idx: 0,
        },
        {
          name: 'Group B', idx: 1,
        },
      ];
      const nextGroup = getNextGroupName(groups);
      expect(nextGroup.name).toBe('Group C');
      expect(nextGroup.idx).toBe(2);
    });

    it('return correct next group name test-case-2', () => {
      const groups = [];
      const nextGroup = getNextGroupName(groups);
      expect(nextGroup.name).toBe('Group A');
      expect(nextGroup.idx).toBe(0);
    });

    it('return correct next group name test-case-3', () => {
      const groups = [
        {
          name: 'Some group', idx: 0,
        },
        {
          name: 'Group B', idx: 1,
        },
      ];
      const nextGroup = getNextGroupName(groups);
      expect(nextGroup.name).toBe('Group C');
      expect(nextGroup.idx).toBe(2);
    });

    it('return correct next group name test-case-4', () => {
      const groups = [
        {
          name: 'Group A', idx: 0,
        },
        {
          name: 'Group A', idx: 1,
        },
      ];
      const nextGroup = getNextGroupName(groups);
      expect(nextGroup.name).toBe('Group C');
      expect(nextGroup.idx).toBe(2);
    });

    it('return correct next group name test-case-5', () => {
      const groups = [
        {
          name: 'Group A', idx: 0,
        },
        {
          name: 'Group C', idx: 1,
        },
        {
          name: 'Group B', idx: 2,
        },
      ];
      const nextGroup = getNextGroupName(groups);
      expect(nextGroup.name).toBe('Group D');
      expect(nextGroup.idx).toBe(3);
    });

    it('return correct next group name test-case-6', () => {
      const groups = [
        {
          name: '', idx: 0,
        },
        {
          name: '', idx: 1,
        },
      ];
      const nextGroup = getNextGroupName(groups);
      expect(nextGroup.name).toBe('Group C');
      expect(nextGroup.idx).toBe(2);
    });

    it('return correct next group name test-case-7', () => {
      const groups = [
        {
          name: 'Group A', idx: 0,
        },
        {
          name: 'Group C', idx: 1,
        },
      ];
      const nextGroup = getNextGroupName(groups);
      expect(nextGroup.name).toBe('Group D');
      expect(nextGroup.idx).toBe(2);
    });

    it('return correct next group name test-case-8', () => {
      const groups = [
        {
          name: 'Group D', idx: 0,
        },
      ];
      const nextGroup = getNextGroupName(groups);
      expect(nextGroup.name).toBe('Group B');
      expect(nextGroup.idx).toBe(1);
    });

    it('return correct next group name test-case-9', () => {
      const groups = [
        {
          name: 'Group E', idx: 4,
        },
      ];
      const nextGroup = getNextGroupName(groups);
      expect(nextGroup.name).toBe('Group F');
    });

    it('return correct next group name test-case-10', () => {
      const groups = [
        {
          name: 'Group E', idx: 0,
        },
      ];
      const nextGroup = getNextGroupName(groups);
      expect(nextGroup.name).toBe('Group B');
    });

    it('return correct next group name test-case-11', () => {
      const simulatedGroupWithAlphabetLength = Array.from(
        { length: 26 },
        (_, idx) => ({ name: 'Test name', idx }),
      );
      const nextGroup = getNextGroupName(simulatedGroupWithAlphabetLength);
      expect(nextGroup.name).toBe('Group AA');
    });

    it('return correct next group name test-case-12', () => {
      const simulatedGroupWithAlphabetLength = Array.from(
        { length: 702 },
        (_, idx) => ({ name: 'Test name', idx }),
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
