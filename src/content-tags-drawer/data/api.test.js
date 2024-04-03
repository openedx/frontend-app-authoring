// @ts-check
import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  taxonomyTagsMock,
  contentTaxonomyTagsMock,
  contentTaxonomyTagsCountMock,
  contentDataMock,
  updateContentTaxonomyTagsMock,
} from '../__mocks__';

import {
  getTaxonomyTagsApiUrl,
  getContentTaxonomyTagsApiUrl,
  getXBlockContentDataApiURL,
  getLibraryContentDataApiUrl,
  getTaxonomyTagsData,
  getContentTaxonomyTagsData,
  getContentData,
  updateContentTaxonomyTags,
  getContentTaxonomyTagsCountApiUrl,
  getContentTaxonomyTagsCount,
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

  it('should get taxonomy tags data with parentTag', async () => {
    const taxonomyId = 123;
    const options = { parentTag: 'Sample Tag' };
    axiosMock.onGet().reply(200, taxonomyTagsMock);
    const result = await getTaxonomyTagsData(taxonomyId, options);

    expect(axiosMock.history.get[0].url).toContain('parent_tag=Sample+Tag');
    expect(result).toEqual(taxonomyTagsMock);
  });

  it('should get taxonomy tags data with page', async () => {
    const taxonomyId = 123;
    const options = { page: 2 };
    axiosMock.onGet().reply(200, taxonomyTagsMock);
    const result = await getTaxonomyTagsData(taxonomyId, options);

    expect(axiosMock.history.get[0].url).toContain('page=2');
    expect(result).toEqual(taxonomyTagsMock);
  });

  it('should get taxonomy tags data with searchTerm', async () => {
    const taxonomyId = 123;
    const options = { searchTerm: 'memo' };
    axiosMock.onGet().reply(200, taxonomyTagsMock);
    const result = await getTaxonomyTagsData(taxonomyId, options);

    expect(axiosMock.history.get[0].url).toContain('search_term=memo');
    expect(result).toEqual(taxonomyTagsMock);
  });

  it('should get content taxonomy tags data', async () => {
    const contentId = 'block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@aaf8b8eb86b54281aeeab12499d2cb0b';
    axiosMock.onGet(getContentTaxonomyTagsApiUrl(contentId)).reply(200, contentTaxonomyTagsMock);
    const result = await getContentTaxonomyTagsData(contentId);

    expect(axiosMock.history.get[0].url).toEqual(getContentTaxonomyTagsApiUrl(contentId));
    expect(result).toEqual(contentTaxonomyTagsMock[contentId]);
  });

  it('should get content taxonomy tags count', async () => {
    const contentId = 'block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@aaf8b8eb86b54281aeeab12499d2cb0b';
    axiosMock.onGet(getContentTaxonomyTagsCountApiUrl(contentId)).reply(200, contentTaxonomyTagsCountMock);
    const result = await getContentTaxonomyTagsCount(contentId);

    expect(axiosMock.history.get[0].url).toEqual(getContentTaxonomyTagsCountApiUrl(contentId));
    expect(result).toEqual(contentTaxonomyTagsCountMock[contentId]);
  });

  it('should get content taxonomy tags count as zero', async () => {
    const contentId = 'block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@aaf8b8eb86b54281aeeab12499d2cb0b';
    axiosMock.onGet(getContentTaxonomyTagsCountApiUrl(contentId)).reply(200, {});
    const result = await getContentTaxonomyTagsCount(contentId);

    expect(axiosMock.history.get[0].url).toEqual(getContentTaxonomyTagsCountApiUrl(contentId));
    expect(result).toEqual(0);
  });

  it('should get content data for course component', async () => {
    const contentId = 'block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@aaf8b8eb86b54281aeeab12499d2cb0b';
    axiosMock.onGet(getXBlockContentDataApiURL(contentId)).reply(200, contentDataMock);
    const result = await getContentData(contentId);

    expect(axiosMock.history.get[0].url).toEqual(getXBlockContentDataApiURL(contentId));
    expect(result).toEqual(contentDataMock);
  });

  it('should get content data for V2 library component', async () => {
    const contentId = 'lb:SampleTaxonomyOrg1:NTL1:html:a3eded6b-2106-429a-98be-63533d563d79';
    axiosMock.onGet(getLibraryContentDataApiUrl(contentId)).reply(200, contentDataMock);
    const result = await getContentData(contentId);

    expect(axiosMock.history.get[0].url).toEqual(getLibraryContentDataApiUrl(contentId));
    expect(result).toEqual(contentDataMock);
  });

  it('should update content taxonomy tags', async () => {
    const contentId = 'block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@aaf8b8eb86b54281aeeab12499d2cb0b';
    const taxonomyId = 3;
    const tags = ['flat taxonomy tag 100', 'flat taxonomy tag 3856'];
    axiosMock.onPut(`${getContentTaxonomyTagsApiUrl(contentId)}`).reply(200, updateContentTaxonomyTagsMock);
    // @ts-ignore
    const result = await updateContentTaxonomyTags(contentId, [{
      taxonomy: taxonomyId,
      tags,
    }]);

    expect(axiosMock.history.put[0].url).toEqual(`${getContentTaxonomyTagsApiUrl(contentId)}`);
    expect(result).toEqual(updateContentTaxonomyTagsMock[contentId]);
  });
});
