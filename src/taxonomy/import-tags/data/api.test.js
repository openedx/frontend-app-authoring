import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { taxonomyImportMock } from '../__mocks__';

import {
  getTaxonomyImportApiUrl,
  importNewTaxonomy,
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

  it('should call import taxonomy', async () => {
    axiosMock.onPost(getTaxonomyImportApiUrl()).reply(201, taxonomyImportMock);
    const result = await importNewTaxonomy('Taxonomy name', 'Taxonomy description');

    expect(axiosMock.history.post[0].url).toEqual(getTaxonomyImportApiUrl());
    expect(result).toEqual(taxonomyImportMock);
  });
});
