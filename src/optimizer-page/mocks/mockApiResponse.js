const mockApiResponse = {
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
                displayName: 'Welcome Video',
                blocks: [
                  {
                    id: 'block-1-1-1-1',
                    url: 'https://example.com/welcome-video',
                    brokenLinks: ['https://example.com/broken-link-algo'],
                    lockedLinks: ['https://example.com/locked-link-algo'],
                  },
                  {
                    id: 'block-1-1-1-2',
                    url: 'https://example.com/intro-guide',
                    brokenLinks: ['https://example.com/broken-link-algo'],
                    lockedLinks: ['https://example.com/locked-link-algo'],
                    externalForbiddenLinks: ['https://outsider.com/forbidden-link-algo'],
                  },
                ],
              },
              {
                id: 'unit-1-1-2',
                displayName: 'Course Overview',
                blocks: [
                  {
                    id: 'block-1-1-2-1',
                    url: 'https://example.com/course-overview',
                    brokenLinks: ['https://example.com/broken-link-algo'],
                    lockedLinks: ['https://example.com/locked-link-algo'],
                  },
                ],
              },
            ],
          },
          {
            id: 'subsection-1-2',
            displayName: 'Basic Concepts',
            units: [
              {
                id: 'unit-1-2-1',
                displayName: 'Variables and Data Types',
                blocks: [
                  {
                    id: 'block-1-2-1-1',
                    url: 'https://example.com/variables',
                    brokenLinks: ['https://example.com/broken-link-algo'],
                    lockedLinks: ['https://example.com/locked-link-algo'],
                  },
                  {
                    id: 'block-1-2-1-2',
                    url: 'https://example.com/broken-link',
                    brokenLinks: ['https://example.com/broken-link'],
                    lockedLinks: ['https://example.com/locked-link-algo'],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'section-2',
        displayName: 'Advanced Topics',
        subsections: [
          {
            id: 'subsection-2-1',
            displayName: 'Algorithms and Data Structures',
            units: [
              {
                id: 'unit-2-1-1',
                displayName: 'Sorting Algorithms',
                blocks: [
                  {
                    id: 'block-2-1-1-1',
                    url: 'https://example.com/sorting-algorithms',
                    brokenLinks: ['https://example.com/broken-link-algo'],
                    lockedLinks: ['https://example.com/locked-link-algo'],
                  },
                  {
                    id: 'block-2-1-1-2',
                    url: 'https://example.com/broken-link-algo',
                    brokenLinks: ['https://example.com/broken-link-algo'],
                    lockedLinks: ['https://example.com/locked-link-algo'],
                    externalForbiddenLinks: ['https://outsider.com/forbidden-link-algo'],
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

export default mockApiResponse;
