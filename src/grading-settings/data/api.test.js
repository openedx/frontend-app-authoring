import { initializeMocks } from '@src/testUtils';

import gradingSettings from '../__mocks__/gradingSettings';
import { getGradingSettings, getGradingSettingsApiUrl, sendGradingSettings } from './api';

let axiosMock;
const courseId = 'course-v1:org+101+101';

const courseDetails = {
  graders: [
    {
      type: 'Homework',
      minCount: 0,
      dropCount: 0,
      shortLabel: null,
      weight: 15,
      id: 0,
    },
    {
      type: 'Lab',
      minCount: 0,
      dropCount: 0,
      shortLabel: null,
      weight: 15,
      id: 1,
    },
    {
      type: 'Midterm Exam',
      minCount: 0,
      dropCount: 0,
      shortLabel: null,
      weight: 30,
      id: 2,
    },
    {
      type: 'Final Exam',
      minCount: 0,
      dropCount: 0,
      shortLabel: null,
      weight: 40,
      id: 3,
    },
  ],
  gradeCutoffs: { a: 0.72, d: 0.71, c: 0.31 },
  gracePeriod: { hours: 7, minutes: 6, seconds: 0 },
  minimumGradeCredit: 0.8,
};

describe('grading settings api', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  describe('getGradingSettings', () => {
    it('should read the full view of the course grading', async () => {
      axiosMock.onGet(getGradingSettingsApiUrl(courseId), { params: { view: 'full' } }).reply(200, gradingSettings);

      await getGradingSettings(courseId);

      expect(axiosMock.history.get[0].url).toEqual(
        'http://localhost:18010/api/authoring/v3/courses/course-v1:org+101+101/grading/',
      );
      expect(axiosMock.history.get[0].params).toEqual({ view: 'full' });
    });

    it('should return the policy as courseDetails beside the page context', async () => {
      axiosMock.onGet(getGradingSettingsApiUrl(courseId)).reply(200, gradingSettings);

      const result = await getGradingSettings(courseId);

      expect(result).toEqual({
        courseDetails,
        courseAssignmentLists: {},
        defaultGradeDesignations: ['A', 'B', 'C', 'D'],
        isCreditCourse: false,
        showCreditEligibility: false,
        mfeProctoredExamSettingsUrl: '',
      });
    });

    it('should keep a course without a grace period or credit minimum as null', async () => {
      axiosMock.onGet(getGradingSettingsApiUrl(courseId)).reply(200, {
        ...gradingSettings,
        grace_period: null,
        minimum_grade_credit: null,
      });

      const result = await getGradingSettings(courseId);

      expect(result.courseDetails.gracePeriod).toBeNull();
      expect(result.courseDetails.minimumGradeCredit).toBeNull();
    });

    it('should list the graded subsections by assignment type', async () => {
      axiosMock.onGet(getGradingSettingsApiUrl(courseId)).reply(200, {
        ...gradingSettings,
        course_assignment_lists: { Homework: ['Section 1 - Subsection 1'] },
      });

      const result = await getGradingSettings(courseId);

      expect(result.courseAssignmentLists).toEqual({ Homework: ['Section 1 - Subsection 1'] });
    });
  });

  describe('sendGradingSettings', () => {
    it('should send the policy in snake_case and return the stored policy', async () => {
      const {
        graders,
        grade_cutoffs: gradeCutoffs,
        grace_period: gracePeriod,
        minimum_grade_credit: minimumGradeCredit,
      } = gradingSettings;
      const storedPolicy = {
        graders,
        grade_cutoffs: gradeCutoffs,
        grace_period: gracePeriod,
        minimum_grade_credit: minimumGradeCredit,
      };
      axiosMock.onPatch(getGradingSettingsApiUrl(courseId)).reply(200, storedPolicy);

      const result = await sendGradingSettings(courseId, courseDetails);

      expect(axiosMock.history.patch[0].url).toEqual(
        'http://localhost:18010/api/authoring/v3/courses/course-v1:org+101+101/grading/',
      );
      expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual(storedPolicy);
      expect(result).toEqual(courseDetails);
    });
  });
});
