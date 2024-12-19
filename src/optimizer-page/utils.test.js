import mockApiResponse from './mocks/mockApiResponse';
import { countBrokenLinks } from './utils';

describe('countBrokenLinks', () => {
  it('should return the count of broken links', () => {
    const data = mockApiResponse.LinkCheckOutput;
    expect(countBrokenLinks(data)).toStrictEqual([5, 2]);
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
    expect(countBrokenLinks(data)).toStrictEqual([0]);
  });

  it('should return [] if there is no data', () => {
    const data = {};
    expect(countBrokenLinks(data)).toStrictEqual([]);
  });

  it('should return [] if there are no sections', () => {
    const data = {
      sections: [],
    };
    expect(countBrokenLinks(data)).toStrictEqual([]);
  });
});
