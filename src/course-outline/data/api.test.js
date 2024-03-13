import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { contentTagsCountMock } from '../__mocks__';
import { getTagsCountApiUrl, getTagsCount } from './api';

let axiosMock;

describe('course outline api calls', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should get tags count', async () => {
    const pattern = 'this,is,a,pattern';
    const contentId = 'block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@aaf8b8eb86b54281aeeab12499d2cb06';
    axiosMock.onGet().reply(200, contentTagsCountMock);
    const result = await getTagsCount(pattern);
    expect(axiosMock.history.get[0].url).toEqual(getTagsCountApiUrl(pattern));
    expect(result).toEqual(contentTagsCountMock);
    expect(contentTagsCountMock[contentId]).toEqual(15);
  });

  it('should get null on empty pattenr', async () => {
    const result = await getTagsCount('');
    expect(result).toEqual(null);
  });
});
