import mockApiResponse from './mocks/mockApiResponse';
import { countBrokenLinks } from './utils';

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
