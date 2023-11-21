import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { tagImportMock, taxonomyImportMock } from '../__mocks__';

import {
  getTaxonomyImportNewApiUrl,
  getTagsImportApiUrl,
  importNewTaxonomy,
  importTags,
} from './api';

let axiosMock;

describe('import taxonomy api calls', () => {
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

  it('should call import new taxonomy', async () => {
    axiosMock.onPost(getTaxonomyImportNewApiUrl()).reply(201, taxonomyImportMock);
    const result = await importNewTaxonomy('Taxonomy name', 'Taxonomy description');

    expect(axiosMock.history.post[0].url).toEqual(getTaxonomyImportApiUrl());
    expect(result).toEqual(taxonomyImportMock);
  });

  it('should call import tags', async () => {
    axiosMock.onPost(getTagsImportApiUrl(1)).reply(200, tagImportMock);
    const result = await importTags(1);

    expect(axiosMock.history.post[0].url).toEqual(getTagsImportApiUrl(1));
    expect(result).toEqual(tagImportMock);
  });
});
