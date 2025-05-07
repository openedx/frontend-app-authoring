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
                displayName: 'Test Broken Links',
                blocks: [
                  {
                    id: 'block-1-1-1-5',
                    url: 'https://example.com/welcome-video',
                    brokenLinks: ['https://example.com/broken-link-algo1'],
                    lockedLinks: [],
                    externalForbiddenLinks: [],
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
                    externalForbiddenLinks: ['https://outsider.com/forbidden-link-algo'],
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
                    lockedLinks: ['https://example.com/locked-link-algo'],
                    externalForbiddenLinks: [],
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
                    brokenLinks: ['https://example.com/broken-link-algo1'],
                    lockedLinks: [],
                    externalForbiddenLinks: [],
                  },
                  {
                    id: 'block-1-1-1-6',
                    url: 'https://example.com/welcome-video',
                    brokenLinks: ['https://example.com/broken-link-algo1'],
                    lockedLinks: ['https://example.com/locked-link-algo'],
                    externalForbiddenLinks: [],
                  },
                  {
                    id: 'block-1-1-1-6',
                    url: 'https://example.com/welcome-video',
                    brokenLinks: ['https://example.com/broken-link-algo1'],
                    lockedLinks: [],
                    externalForbiddenLinks: ['https://outsider.com/forbidden-link-algo'],
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
                    brokenLinks: ['https://example.com/broken-link-algo1'],
                    lockedLinks: [],
                    externalForbiddenLinks: ['https://outsider.com/forbidden-link-algo'],
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
                    brokenLinks: ['https://example.com/broken-link-algo1'],
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
