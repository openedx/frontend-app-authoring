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
    const tags = {
      tags: [
        { id: 'tag_1', value: 'Tag 1' },
      ],
    };
    const str = JSON.stringify(tags);
    const blob = new Blob([str]);
    const file = new File([blob], 'taxonomy.json', {
      type: 'application/JSON',
    });
    const formData = new FormData();
    formData.append('taxonomy_name', 'Taxonomy name');
    formData.append('taxonomy_description', 'Taxonomy description');
    formData.append('file', file);
    formData.asymmetricMatch = () => true;
    axiosMock.onPost(getTaxonomyImportApiUrl(), formData).reply(201, taxonomyImportMock);
    const result = await importNewTaxonomy('Taxonomy name', 'Taxonomy description', file);

    expect(axiosMock.history.post[0].url).toEqual(getTaxonomyImportApiUrl());
    expect(result).toEqual(taxonomyImportMock);
  });
});
