export const currentSectionMock = {
  displayName: 'Section1',
  category: 'chapter',
  start: '2025-08-10T10:00:00Z',
  visibilityState: true,
  format: 'Not Graded',
  childInfo: {
    displayName: 'Subsection',
    children: [
      {
        displayName: 'Subsection 1',
        id: 1,
        category: 'sequential',
        due: '',
        start: '2025-08-10T10:00:00Z',
        visibilityState: true,
        defaultTimeLimitMinutes: null,
        hideAfterDue: false,
        showCorrectness: false,
        format: 'Homework',
        courseGraders: ['Homework', 'Exam'],
        childInfo: {
          displayName: 'Unit',
          children: [
            {
              id: 11,
              displayName: 'Subsection_1 Unit 1',
            },
          ],
        },
      },
      {
        displayName: 'Subsection 2',
        id: 2,
        category: 'sequential',
        due: '',
        start: '2025-08-10T10:00:00Z',
        visibilityState: true,
        defaultTimeLimitMinutes: null,
        hideAfterDue: false,
        showCorrectness: false,
        format: 'Homework',
        courseGraders: ['Homework', 'Exam'],
        childInfo: {
          displayName: 'Unit',
          children: [
            {
              id: 21,
              displayName: 'Subsection_2 Unit 1',
            },
          ],
        },
      },
      {
        displayName: 'Subsection 3',
        id: 3,
        category: 'sequential',
        due: '',
        start: '2025-08-10T10:00:00Z',
        visibilityState: true,
        defaultTimeLimitMinutes: null,
        hideAfterDue: false,
        showCorrectness: false,
        format: 'Homework',
        courseGraders: ['Homework', 'Exam'],
        childInfo: {
          children: [],
        },
      },
    ],
  },
};

export const currentSubsectionMock = {
  displayName: 'Subsection 1',
  id: 1,
  category: 'sequential',
  due: '',
  start: '2025-08-10T10:00:00Z',
  visibilityState: true,
  defaultTimeLimitMinutes: null,
  hideAfterDue: false,
  showCorrectness: false,
  format: 'Homework',
  courseGraders: ['Homework', 'Exam'],
  childInfo: {
    displayName: 'Unit',
    children: [
      {
        id: 11,
        displayName: 'Subsection_1 Unit 1',
      },
      {
        id: 12,
        displayName: 'Subsection_1 Unit 2',
      },
    ],
  },
};

export const currentUnitMock = {
  displayName: 'Unit 1',
  id: 1,
  category: 'vertical',
  due: '',
  start: '2025-08-10T10:00:00Z',
  visibilityState: true,
  defaultTimeLimitMinutes: null,
  hideAfterDue: false,
  showCorrectness: false,
  userPartitionInfo: {
    selectablePartitions: [
      {
        id: 50,
        name: 'Enrollment Track Groups',
        scheme: 'enrollment_track',
        groups: [
          {
            id: 6,
            name: 'Honor',
            selected: false,
            deleted: false,
          },
          {
            id: 2,
            name: 'Verified',
            selected: false,
            deleted: false,
          },
        ],
      },
      {
        id: 1508065533,
        name: 'Content Groups',
        scheme: 'cohort',
        groups: [
          {
            id: 1224170703,
            name: 'Content Group 1',
            selected: false,
            deleted: false,
          },
        ],
      },
    ],
    selectedPartitionIndex: -1,
    selectedGroupsLabel: '',
  },
};

export const currentXBlockMock = {
  displayName: 'Unit 1',
  id: 1,
  category: 'component',
  due: '',
  start: '2025-08-10T10:00:00Z',
  visibilityState: true,
  defaultTimeLimitMinutes: null,
  hideAfterDue: false,
  showCorrectness: false,
  userPartitionInfo: {
    selectablePartitions: [
      {
        id: 50,
        name: 'Enrollment Track Groups',
        scheme: 'enrollment_track',
        groups: [
          {
            id: 6,
            name: 'Honor',
            selected: false,
            deleted: false,
          },
          {
            id: 2,
            name: 'Verified',
            selected: false,
            deleted: false,
          },
        ],
      },
      {
        id: 1508065533,
        name: 'Content Groups',
        scheme: 'cohort',
        groups: [
          {
            id: 1224170703,
            name: 'Content Group 1',
            selected: false,
            deleted: false,
          },
        ],
      },
    ],
    selectedPartitionIndex: -1,
    selectedGroupsLabel: '',
  },
};
