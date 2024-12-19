import { pollLinkCheckDuringScan } from './CourseOptimizerPage';

describe('CourseOptimizerPage', () => {
  describe('pollLinkCheckDuringScan', () => {
    it('should start polling if linkCheckInProgress has never been started (is null)', () => {
      const linkCheckInProgress = null;
      const linkCheckResult = 'someresult';
      const interval = { current: null };
      const dispatch = jest.fn();
      const courseId = 'course-123';
      pollLinkCheckDuringScan(linkCheckInProgress, linkCheckResult, interval, dispatch, courseId);
      expect(interval.current).not.toBeNull();
    });

    it('should start polling if link check is in progress', () => {
      const linkCheckInProgress = true;
      const linkCheckResult = 'someresult';
      const interval = { current: null };
      const dispatch = jest.fn();
      const courseId = 'course-123';
      pollLinkCheckDuringScan(linkCheckInProgress, linkCheckResult, interval, dispatch, courseId);
      expect(interval.current).not.toBeNull();
    });
    it('should start polling if there is no linkCheckResult', () => {
      const linkCheckInProgress = false;
      const linkCheckResult = null;
      const interval = { current: null };
      const dispatch = jest.fn();
      const courseId = 'course-123';
      pollLinkCheckDuringScan(linkCheckInProgress, linkCheckResult, interval, dispatch, courseId);
      expect(interval.current).not.toBeNull();
    });
    it('should clear the interval if link check is finished', () => {
      const linkCheckInProgress = false;
      const linkCheckResult = 'someresult';
      const interval = { current: 1 };
      const dispatch = jest.fn();
      const courseId = 'course-123';
      pollLinkCheckDuringScan(linkCheckInProgress, linkCheckResult, interval, dispatch, courseId);
      expect(interval.current).toBeNull();
    });
  });
});
