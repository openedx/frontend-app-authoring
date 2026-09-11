import { mockApiResponse, mockApiResponseWithPreviousRunLinks } from './mocks/mockApiResponse';
import {
  areAllPreviousRunLinksUpdated,
  buildBlockContainerUrl,
  buildSyntheticSections,
  countBrokenLinks,
  countPreviousRunLinksBySection,
  filterSectionsWithPreviousRunLinks,
  hasPreviousRunLinks,
  isDataEmpty,
} from './utils';

describe('countBrokenLinks', () => {
  it('should return the count of broken links', () => {
    const data = mockApiResponse.LinkCheckOutput;
    expect(countBrokenLinks(data)).toStrictEqual(
      {
        brokenLinksCounts: [1, 5],
        lockedLinksCounts: [1, 2],
        externalForbiddenLinksCounts: [1, 3],
      },
    );
  });

  it('should return 0 if there are no broken links', () => {
    const data = {
      sections: [
        {
          subsections: [
            {
              units: [
                {
                  blocks: [
                    {
                      brokenLinks: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
    expect(countBrokenLinks(data)).toStrictEqual(
      {
        brokenLinksCounts: [0],
        lockedLinksCounts: [0],
        externalForbiddenLinksCounts: [0],
      },
    );
  });

  it('should return [] if there is no data', () => {
    const data = {};
    expect(countBrokenLinks(data)).toStrictEqual(
      {
        brokenLinksCounts: [],
        lockedLinksCounts: [],
        externalForbiddenLinksCounts: [],
      },
    );
  });

  it('should return [] if there are no sections', () => {
    const data = {
      sections: [],
    };
    expect(countBrokenLinks(data)).toStrictEqual(
      {
        brokenLinksCounts: [],
        lockedLinksCounts: [],
        externalForbiddenLinksCounts: [],
      },
    );
  });
});

describe('isDataEmpty', () => {
  it('should return true when data is null', () => {
    expect(isDataEmpty(null)).toBe(true);
  });

  it('should return false when courseUpdates contains previousRunLinks', () => {
    const data = {
      courseUpdates: [
        {
          brokenLinks: [],
          lockedLinks: [],
          externalForbiddenLinks: [],
          previousRunLinks: [{ originalLink: 'https://prev.link' }],
        },
      ],
      sections: [],
      customPages: [],
    };
    expect(isDataEmpty(data)).toBe(false);
  });

  it('should return false when customPages contains previousRunLinks', () => {
    const data = {
      customPages: [
        {
          brokenLinks: [],
          lockedLinks: [],
          externalForbiddenLinks: [],
          previousRunLinks: [{ originalLink: 'https://prev.link' }],
        },
      ],
      sections: [],
      courseUpdates: [],
    };
    expect(isDataEmpty(data)).toBe(false);
  });
});

describe('previous run link helpers', () => {
  const data = mockApiResponseWithPreviousRunLinks.LinkCheckOutput;
  const sections = buildSyntheticSections(
    data.courseUpdates,
    data.customPages,
    { courseUpdates: 'Course updates', customPages: 'Custom pages' },
  ).concat(data.sections);

  it('builds synthetic sections in order with the expected shape', () => {
    expect(buildSyntheticSections(
      [{
        id: 'update-1',
        displayName: 'Update',
        url: 'https://example.com/update',
        brokenLinks: [],
        lockedLinks: [],
        externalForbiddenLinks: [],
        previousRunLinks: [{ originalLink: 'https://example.com/old', isUpdated: false }],
      }],
      undefined,
      { courseUpdates: 'Course updates', customPages: 'Custom pages' },
    )).toStrictEqual([{
      id: 'course-updates',
      displayName: 'Course updates',
      subsections: [{
        id: 'course-updates-subsection',
        displayName: 'Course updates Subsection',
        units: [{
          id: 'update-1',
          displayName: 'Update',
          url: 'https://example.com/update',
          blocks: [{
            id: 'update-1',
            displayName: 'Update',
            url: 'https://example.com/update',
            brokenLinks: [],
            lockedLinks: [],
            externalForbiddenLinks: [],
            previousRunLinks: [{ originalLink: 'https://example.com/old', isUpdated: false }],
          }],
        }],
      }],
    }]);
  });

  it('detects, counts, and filters previous-run links by section', () => {
    expect(hasPreviousRunLinks(sections)).toBe(true);
    expect(countPreviousRunLinksBySection(sections)).toStrictEqual({
      'course-updates': 1,
      'custom-pages': 1,
      'section-1': 2,
    });
    expect(filterSectionsWithPreviousRunLinks(sections).map(section => section.id)).toStrictEqual([
      'course-updates',
      'custom-pages',
      'section-1',
    ]);
  });

  it('uses local update IDs with API update status for completion', () => {
    expect(areAllPreviousRunLinksUpdated(sections, [
      'update-1:https://example.com/old-course-run/update',
      'custom-2:https://example.com/old-course-run/about',
      'block-1-1-1-5:https://example.com/old-course-run/content',
    ])).toBe(true);
    expect(areAllPreviousRunLinksUpdated(sections, [])).toBe(false);
    expect(areAllPreviousRunLinksUpdated(mockApiResponse.LinkCheckOutput.sections, [])).toBe(false);
  });
});

describe('buildBlockContainerUrl', () => {
  it('should build a correct internal route for block container', () => {
    const courseId = 'course-v1:Test+Course+2024';
    const unitId = 'unit123';
    const blockId = 'block456';

    const result = buildBlockContainerUrl(courseId, unitId, blockId);

    expect(result).toBe(
      `/course/${courseId}/container/${unitId}#${blockId}`,
    );
  });
});
