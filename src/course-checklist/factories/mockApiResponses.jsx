import { RequestStatus } from '../../data/constants';

export const courseId = 'course-v1:edX+DemoX+Demo_Course';

export const initialState = {
  courseDetail: {
    courseId,
    status: 'sucessful',
  },
  courseChecklist: {
    loadingStatus: {
      launchChecklistStatus: RequestStatus.IN_PROGRESS,
      bestPracticeChecklistStatus: RequestStatus.IN_PROGRESS,
    },
    launchData: {},
    bestPracticesData: {},
  },
};

export const generateCourseBestPracticesData = () => ({
  is_self_paced: false,
  sections: {
    total_number: 2,
    total_visible: 2,
    number_with_highlights: 0,
    highlights_active_for_course: false,
    highlights_enabled: true,
  },
  subsections: {
    total_visible: 1,
    num_with_one_block_type: 1,
    num_block_types: {
      min: 1,
      max: 1,
      mean: 1.0,
      median: 1.0,
      mode: 1,
    },
  },
  units: {
    total_visible: 1,
    num_blocks: {
      min: 1,
      max: 1,
      mean: 1.0,
      median: 1.0,
      mode: 1,
    },
  },
  videos: {
    total_number: 10,
    num_mobile_encoded: 5,
    num_with_val_id: 10,
    durations: {
      min: 9.409,
      max: 168.001,
      mean: 41.0,
      median: 9.0,
      mode: 9.409,
    },
  },
});

export const generateCourseLaunchData = () => ({
  is_self_paced: false,
  dates: {
    has_start_date: true,
    has_end_date: true,
  },
  assignments: {
    total_number: 2,
    total_visible: 2,
    assignments_with_dates_before_start: [],
    assignments_with_dates_after_end: [
      {
        id: 'block-v1',
        display_name: 'Subsection',
      },
    ],
    assignments_with_ora_dates_before_start: [
      {
        id: 'block-v2',
        display_name: 'ORA subsection',
      },
    ],
    assignments_with_ora_dates_after_end: [],
  },
  grades: {
    has_grading_policy: true,
    sum_of_weights: 0.9500000000000001,
  },
  certificates: {
    is_activated: false,
    has_certificate: false,
    is_enabled: true,
  },
  updates: {
    has_update: true,
  },
  proctoring: {
    needs_proctoring_escalation_email: true,
    has_proctoring_escalation_email: false,
  },
});
