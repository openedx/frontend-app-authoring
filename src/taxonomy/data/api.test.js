import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { taxonomyListMock } from '../__mocks__';

import {
  getExportTaxonomyApiUrl,
  getTaxonomyExportFile,
  getTaxonomyListApiUrl,
  getTaxonomyListData,
  getTaxonomyApiUrl,
  getTaxonomy,
  deleteTaxonomy,
} from './api';

let axiosMock;

describe('taxonomy api calls', () => {
  const { location } = window;
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

  beforeAll(() => {
    delete window.location;
    window.location = {
      href: '',
    };
  });

  afterAll(() => {
    window.location = location;
  });

  it.each([
    undefined,
    'All taxonomies',
    'Unassigned',
    'testOrg',
  ])('should get taxonomy list data for \'%s\' org filter', async (org) => {
    axiosMock.onGet(getTaxonomyListApiUrl(org)).reply(200, taxonomyListMock);
    const result = await getTaxonomyListData(org);

    expect(axiosMock.history.get[0].url).toEqual(getTaxonomyListApiUrl(org));
    expect(result).toEqual(taxonomyListMock);
  });

  it('should delete a taxonomy', async () => {
    axiosMock.onDelete(getTaxonomyApiUrl()).reply(200);
    await deleteTaxonomy();

    expect(axiosMock.history.delete[0].url).toEqual(getTaxonomyApiUrl());
  });

  it('should call get taxonomy', async () => {
    axiosMock.onGet(getTaxonomyApiUrl(1)).reply(200);
    await getTaxonomy(1);

    expect(axiosMock.history.get[0].url).toEqual(getTaxonomyApiUrl(1));
  });

  it('Export should set window.location.href correctly', () => {
    const pk = 1;
    const format = 'json';

    getTaxonomyExportFile(pk, format);

    expect(window.location.href).toEqual(getExportTaxonomyApiUrl(pk, format));
  });
});
