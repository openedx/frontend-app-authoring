import { initializeMocks } from '../../testUtils';
import * as api from './api';

let axiosMock;

describe('library data API', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  describe('createLibraryBlock', () => {
    it('should create library block', async () => {
      const libraryId = 'lib:org:1';
      const url = api.getCreateLibraryBlockUrl(libraryId);
      axiosMock.onPost(url).reply(200);
      await api.createLibraryBlock({
        libraryId,
        blockType: 'html',
        definitionId: '1',
      });

      expect(axiosMock.history.post[0].url).toEqual(url);
    });
  });

  describe('deleteLibraryBlock', () => {
    it('should delete a library block', async () => {
      const usageKey = 'lib:org:1';
      const url = api.getLibraryBlockMetadataUrl(usageKey);
      axiosMock.onDelete(url).reply(200);
      await api.deleteLibraryBlock({ usageKey });
      expect(axiosMock.history.delete[0].url).toEqual(url);
    });
  });

  describe('restoreLibraryBlock', () => {
    it('should restore a soft-deleted library block', async () => {
      const usageKey = 'lib:org:1';
      const url = api.getLibraryBlockRestoreUrl(usageKey);
      axiosMock.onPost(url).reply(200);
      await api.restoreLibraryBlock({ usageKey });
      expect(axiosMock.history.post[0].url).toEqual(url);
    });
  });

  describe('commitLibraryChanges', () => {
    it('should commit library changes', async () => {
      const libraryId = 'lib:org:1';
      const url = api.getCommitLibraryChangesUrl(libraryId);
      axiosMock.onPost(url).reply(200);

      await api.commitLibraryChanges(libraryId);

      expect(axiosMock.history.post[0].url).toEqual(url);
    });
  });

  describe('revertLibraryChanges', () => {
    it('should revert library changes', async () => {
      const libraryId = 'lib:org:1';
      const url = api.getCommitLibraryChangesUrl(libraryId);
      axiosMock.onDelete(url).reply(200);

      await api.revertLibraryChanges(libraryId);

      expect(axiosMock.history.delete[0].url).toEqual(url);
    });
  });

  describe('getBlockTypes', () => {
    it('should get block types metadata', async () => {
      const libraryId = 'lib:org:1';
      const url = api.getBlockTypesMetaDataUrl(libraryId);
      axiosMock.onGet(url).reply(200);

      await api.getBlockTypes(libraryId);

      expect(axiosMock.history.get[0].url).toEqual(url);
    });
  });

  it('should create collection', async () => {
    const libraryId = 'lib:org:1';
    const url = api.getLibraryCollectionsApiUrl(libraryId);

    axiosMock.onPost(url).reply(200);

    await api.createCollection(libraryId, {
      title: 'This is a test',
      description: 'This is only a test',
    });

    expect(axiosMock.history.post[0].url).toEqual(url);
  });

  it('should delete a container', async () => {
    const containerId = 'lct:org:lib1';
    const url = api.getLibraryContainerApiUrl(containerId);

    axiosMock.onDelete(url).reply(200);

    await api.deleteContainer(containerId);
    expect(axiosMock.history.delete[0].url).toEqual(url);
  });

  it('should restore a container', async () => {
    const containerId = 'lct:org:lib1';
    const url = api.getLibraryContainerRestoreApiUrl(containerId);

    axiosMock.onPost(url).reply(200);

    await api.restoreContainer(containerId);
  });

  it('should add components to unit', async () => {
    const componentId = 'lb:org:lib:html:1';
    const containerId = 'lct:org:lib:unit:1';
    const url = api.getLibraryContainerChildrenApiUrl(containerId);

    axiosMock.onPost(url).reply(200);

    await api.addComponentsToContainer(containerId, [componentId]);
    expect(axiosMock.history.post[0].url).toEqual(url);
  });

  it('should update container children', async () => {
    const containerId = 'lct:org:lib1';
    const url = api.getLibraryContainerChildrenApiUrl(containerId);

    axiosMock.onPatch(url).reply(200);

    await api.updateLibraryContainerChildren(containerId, ['test']);
    expect(axiosMock.history.patch[0].url).toEqual(url);
  });

  it('should remove container children', async () => {
    const containerId = 'lct:org:lib1';
    const url = api.getLibraryContainerChildrenApiUrl(containerId);

    axiosMock.onDelete(url).reply(200);

    await api.removeLibraryContainerChildren(containerId, ['test']);
    expect(axiosMock.history.delete[0].url).toEqual(url);
  });

  it('getContentLibraryV2List', async () => {
    const url = api.getContentLibraryV2ListApiUrl();

    axiosMock.onGet(url).reply(200, { some: 'data' });

    await api.getContentLibraryV2List({ type: 'complex' });
    expect(axiosMock.history.get[0].url).toEqual(url);
  });
});
