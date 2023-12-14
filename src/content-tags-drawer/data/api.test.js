import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  taxonomyTagsMock,
  contentTaxonomyTagsMock,
  contentDataMock,
  updateContentTaxonomyTagsMock,
} from '../__mocks__';

import {
  getTaxonomyTagsApiUrl,
  getContentTaxonomyTagsApiUrl,
  getContentDataApiUrl,
  getTaxonomyTagsData,
  getContentTaxonomyTagsData,
  getContentData,
  updateContentTaxonomyTags,
} from './api';

let axiosMock;

describe('content tags drawer api calls', () => {
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

  it('should get taxonomy tags data', async () => {
    const taxonomyId = 123;
    axiosMock.onGet().reply(200, taxonomyTagsMock);
    const result = await getTaxonomyTagsData(taxonomyId);

    expect(axiosMock.history.get[0].url).toEqual(getTaxonomyTagsApiUrl(taxonomyId));
    expect(result).toEqual(taxonomyTagsMock);
  });

  it('should get taxonomy tags data with fullPathProvided', async () => {
    const taxonomyId = 123;
    const fullPathProvided = 'http://example.com/';
    axiosMock.onGet().reply(200, taxonomyTagsMock);
    const result = await getTaxonomyTagsData(taxonomyId, fullPathProvided);

    expect(axiosMock.history.get[0].url).toEqual(new URL(`${fullPathProvided}`));
    expect(result).toEqual(taxonomyTagsMock);
  });

  it('should get content taxonomy tags data', async () => {
    const contentId = 'block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@aaf8b8eb86b54281aeeab12499d2cb0b';
    axiosMock.onGet(getContentTaxonomyTagsApiUrl(contentId)).reply(200, contentTaxonomyTagsMock);
    const result = await getContentTaxonomyTagsData(contentId);

    expect(axiosMock.history.get[0].url).toEqual(getContentTaxonomyTagsApiUrl(contentId));
    expect(result).toEqual(contentTaxonomyTagsMock[contentId]);
  });

  it('should get content data', async () => {
    const contentId = 'block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@aaf8b8eb86b54281aeeab12499d2cb0b';
    axiosMock.onGet(getContentDataApiUrl(contentId)).reply(200, contentDataMock);
    const result = await getContentData(contentId);

    expect(axiosMock.history.get[0].url).toEqual(getContentDataApiUrl(contentId));
    expect(result).toEqual(contentDataMock);
  });

  it('should update content taxonomy tags', async () => {
    const contentId = 'block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@aaf8b8eb86b54281aeeab12499d2cb0b';
    const taxonomyId = 3;
    const tags = ['flat taxonomy tag 100', 'flat taxonomy tag 3856'];
    axiosMock.onPut(`${getContentTaxonomyTagsApiUrl(contentId)}?taxonomy=${taxonomyId}`).reply(200, updateContentTaxonomyTagsMock);
    const result = await updateContentTaxonomyTags(contentId, taxonomyId, tags);

    expect(axiosMock.history.put[0].url).toEqual(`${getContentTaxonomyTagsApiUrl(contentId)}?taxonomy=${taxonomyId}`);
    expect(result).toEqual(updateContentTaxonomyTagsMock[contentId]);
  });
});
