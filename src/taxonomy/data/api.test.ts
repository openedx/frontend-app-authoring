import { initializeMocks } from '../../testUtils';
import { taxonomyListMock } from '../__mocks__';

import {
  apiUrls,
  getTaxonomyExportFile,
  getTaxonomyListData,
  getTaxonomy,
  deleteTaxonomy,
} from './api';

describe('taxonomy api calls', () => {
  it.each([
    undefined,
    'All taxonomies',
    'Unassigned',
    'testOrg',
  ])('should get taxonomy list data for \'%s\' org filter', async (org) => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(apiUrls.taxonomyList(org)).reply(200, taxonomyListMock);
    const result = await getTaxonomyListData(org);

    expect(axiosMock.history.get[0].url).toEqual(apiUrls.taxonomyList(org));
    expect(result).toEqual(taxonomyListMock);
  });

  it('should delete a taxonomy', async () => {
    const { axiosMock } = initializeMocks();
    const taxonomyId = 123;
    axiosMock.onDelete(apiUrls.taxonomy(taxonomyId)).reply(200);
    await deleteTaxonomy(taxonomyId);

    expect(axiosMock.history.delete[0].url).toEqual(apiUrls.taxonomy(taxonomyId));
  });

  it('should call get taxonomy', async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(apiUrls.taxonomy(1)).reply(200);
    await getTaxonomy(1);

    expect(axiosMock.history.get[0].url).toEqual(apiUrls.taxonomy(1));
  });

  it('Export should set window.location.href correctly', () => {
    initializeMocks();
    const origLocation = window.location;
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { href: '' };

    const pk = 1;
    const format = 'json';
    getTaxonomyExportFile(pk, format);
    expect(window.location.href).toEqual(apiUrls.exportTaxonomy(pk, format));

    // Restore the location object of window:
    window.location = origLocation;
  });
});
