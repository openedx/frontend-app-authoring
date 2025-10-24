import moment from 'moment';

export const mockReleaseNote = {
  id: 1,
  title: 'Test Release Note',
  description: '<p>Test description</p>',
  published_at: '2025-01-15T10:00:00Z',
  created_by: 'test@example.com',
};

export const mockReleaseNotes = [
  {
    id: 1,
    title: 'Release Note 1',
    description: '<p>Description 1</p>',
    published_at: moment().subtract(1, 'days').toISOString(),
    created_by: 'user1@example.com',
  },
  {
    id: 2,
    title: 'Release Note 2',
    description: '<p>Description 2</p>',
    published_at: moment().toISOString(),
    created_by: 'user2@example.com',
  },
  {
    id: 3,
    title: 'Unscheduled Note',
    description: '<p>Unscheduled description</p>',
    published_at: null,
    created_by: 'user3@example.com',
  },
  {
    id: 4,
    title: 'Future Scheduled Note',
    description: '<p>Future description</p>',
    published_at: moment().add(2, 'days').toISOString(),
    created_by: 'user4@example.com',
  },
];

export const mockFormInitialValues = {
  id: undefined,
  title: '',
  description: '',
  published_at: '',
};

export const mockFormFilledValues = {
  id: 5,
  title: 'Test Title',
  description: '<p>Test Description</p>',
  published_at: '2025-01-20T14:30:00Z',
};

export const mockState = {
  releaseNotes: {
    releaseNotes: mockReleaseNotes,
    releaseNotesCount: mockReleaseNotes.length,
    loadingStatus: 'successful',
    savingStatus: '',
    hasMore: false,
    errors: {},
  },
  courseDetail: {},
};
