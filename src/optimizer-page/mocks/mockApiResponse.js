export const mockApiResponse = {
  LinkCheckStatus: 'Succeeded',
  LinkCheckCreatedAt: '2024-12-14T00:26:50.838350Z',
  LinkCheckOutput: {
    sections: [
      {
        id: 'section-1',
        displayName: 'Introduction to Programming',
        subsections: [
          {
            id: 'subsection-1-1',
            displayName: 'Getting Started',
            units: [
              {
                id: 'unit-1-1-1',
                displayName: 'Test Broken Links',
                blocks: [
                  {
                    id: 'block-1-1-1-5',
                    url: 'https://example.com/welcome-video',
                    brokenLinks: ['https://example.com/broken-link'],
                    lockedLinks: [],
                    externalForbiddenLinks: [],
                    previousRunLinks: [],
                  },
                ],
              },
              {
                id: 'unit-1-1-3',
                displayName: 'Test Manual Links',
                blocks: [
                  {
                    id: 'block-1-1-1-1',
                    url: 'https://example.com/welcome-video',
                    brokenLinks: [],
                    lockedLinks: [],
                    externalForbiddenLinks: ['https://outsider.com/forbidden-link'],
                    previousRunLinks: [],
                  },
                ],
              },
              {
                id: 'unit-1-1-2',
                displayName: 'Test Locked Links',
                blocks: [
                  {
                    id: 'block-1-1-2-1',
                    url: 'https://example.com/course-overview',
                    brokenLinks: [],
                    lockedLinks: ['https://example.com/locked-link'],
                    externalForbiddenLinks: [],
                    previousRunLinks: [],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'section-2',
        displayName: 'Introduction to Programming 2',
        subsections: [
          {
            id: 'subsection-1-2',
            displayName: 'Getting Started 2',
            units: [
              {
                id: 'unit-2-2-2',
                displayName: 'unit',
                blocks: [
                  {
                    id: 'block-1-1-1-6',
                    url: 'https://example.com/welcome-video',
                    brokenLinks: ['https://example.com/broken-link'],
                    lockedLinks: [],
                    externalForbiddenLinks: [],
                    previousRunLinks: [],
                  },
                  {
                    id: 'block-1-1-1-6',
                    url: 'https://example.com/welcome-video',
                    brokenLinks: ['https://example.com/broken-link'],
                    lockedLinks: ['https://example.com/locked-link'],
                    externalForbiddenLinks: [],
                    previousRunLinks: [],
                  },
                  {
                    id: 'block-1-1-1-6',
                    url: 'https://example.com/welcome-video',
                    brokenLinks: ['https://example.com/broken-link'],
                    lockedLinks: [],
                    externalForbiddenLinks: ['https://outsider.com/forbidden-link'],
                    previousRunLinks: [],
                  },
                ],
              },
              {
                id: 'unit-2-2-3',
                displayName: 'unit',
                blocks: [
                  {
                    id: 'block-1-1-1-7',
                    url: 'https://example.com/welcome-video',
                    brokenLinks: ['https://example.com/broken-link'],
                    lockedLinks: [],
                    externalForbiddenLinks: ['https://outsider.com/forbidden-link'],
                    previousRunLinks: [],
                  },
                ],
              },
              {
                id: 'unit-2-2-4',
                displayName: 'Test Locked Links',
                blocks: [
                  {
                    id: 'block-1-1-7-1',
                    url: 'https://example.com/course-overview',
                    brokenLinks: ['https://example.com/broken-link'],
                    lockedLinks: ['https://example.com/locked-link'],
                    externalForbiddenLinks: ['https://outsider.com/forbidden-link'],
                    previousRunLinks: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    courseUpdates: [
      {
        id: 'update-1',
        displayName: 'Course Update 1',
        url: 'https://example.com/course-update-1',
        brokenLinks: [],
        lockedLinks: [],
        externalForbiddenLinks: [],
        previousRunLinks: [],
      },
    ],
    customPages: [
      {
        id: 'custom-1',
        displayName: 'About Page',
        url: 'https://example.com/about',
        brokenLinks: [],
        lockedLinks: [],
        externalForbiddenLinks: [],
        previousRunLinks: [],
      },
    ],
  },
};

export const mockApiResponseForNoResultFound = {
  LinkCheckStatus: 'Succeeded',
  LinkCheckCreatedAt: '2024-12-14T00:26:50.838350Z',
  LinkCheckOutput: {
    sections: [
      {
        id: 'section-1',
        displayName: 'Introduction to Programming',
        subsections: [
          {
            id: 'subsection-1-1',
            displayName: 'Getting Started',
            units: [
              {
                id: 'unit-1-1-1',
                displayName: 'Test Broken Links',
                blocks: [
                  {
                    id: 'block-1-1-1-5',
                    url: 'https://example.com/welcome-video',
                    brokenLinks: ['https://example.com/broken-link'],
                    lockedLinks: [],
                    externalForbiddenLinks: [],
                    previousRunLinks: [],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

export const mockApiResponseWithPreviousRunLinks = {
  LinkCheckStatus: 'Succeeded',
  LinkCheckCreatedAt: '2024-12-14T00:26:50.838350Z',
  LinkCheckOutput: {
    sections: [
      {
        id: 'section-1',
        displayName: 'Introduction to Programming',
        subsections: [
          {
            id: 'subsection-1-1',
            displayName: 'Getting Started',
            units: [
              {
                id: 'unit-1-1-1',
                displayName: 'Test Previous Run Links',
                blocks: [
                  {
                    id: 'block-1-1-1-5',
                    url: 'https://example.com/welcome-video',
                    brokenLinks: [],
                    lockedLinks: [],
                    externalForbiddenLinks: [],
                    previousRunLinks: [
                      { originalLink: 'https://example.com/old-course-run/content', isUpdated: false },
                      { originalLink: 'https://example.com/old-course-run/content2', isUpdated: true, updatedLink: 'https://example.com/new-course-run/content2' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    courseUpdates: [
      {
        id: 'update-1',
        displayName: 'Course Update with Previous Run Link',
        url: 'https://example.com/course-update-1',
        brokenLinks: [],
        lockedLinks: [],
        externalForbiddenLinks: [],
        previousRunLinks: [
          { originalLink: 'https://example.com/old-course-run/update', isUpdated: true, updatedLink: 'https://example.com/new-course-run/update' },
        ],
      },
    ],
    customPages: [
      {
        id: 'custom-2',
        displayName: 'About Page with Previous Run',
        url: 'https://example.com/about',
        brokenLinks: [],
        lockedLinks: [],
        externalForbiddenLinks: [],
        previousRunLinks: [
          { originalLink: 'https://example.com/old-course-run/about', isUpdated: false },
        ],
      },
    ],
  },
};

export const mockApiResponseEmpty = {
  LinkCheckStatus: 'Succeeded',
  LinkCheckCreatedAt: '2024-12-14T00:26:50.838350Z',
  LinkCheckOutput: {
    sections: [],
    courseUpdates: [],
    customPages: [],
  },
};
