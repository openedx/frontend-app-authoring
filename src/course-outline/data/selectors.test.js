import { getTimedExamsFlag, getProctoredExamsFlag } from './selectors';

const mockState = {
  courseOutline: {
    enableTimedExams: true,
    enableProctoredExams: false,
  },
};

describe('course-outline selectors', () => {
  describe('getTimedExamsFlag', () => {
    it('returns enableTimedExams value from state', () => {
      expect(getTimedExamsFlag(mockState)).toBe(true);
    });

    it('returns false when enableTimedExams is false', () => {
      const stateWithDisabledExams = {
        courseOutline: {
          ...mockState.courseOutline,
          enableTimedExams: false,
        },
      };
      expect(getTimedExamsFlag(stateWithDisabledExams)).toBe(false);
    });

    it('returns undefined when enableTimedExams is not set', () => {
      const stateWithoutProperty = {
        courseOutline: {
          enableProctoredExams: false,
        },
      };
      expect(getTimedExamsFlag(stateWithoutProperty)).toBeUndefined();
    });
  });

  describe('getProctoredExamsFlag', () => {
    it('returns enableProctoredExams value from state', () => {
      expect(getProctoredExamsFlag(mockState)).toBe(false);
    });
  });
});
