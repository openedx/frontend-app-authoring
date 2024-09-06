import { initializeMocks } from '../../testUtils';
import * as api from './api';

describe('library data API', () => {
  describe('getLibraryBlockTypes', () => {
    it('throws an error for invalid libraryId', () => {
      const err = 'The current API for block types requires a libraryId.';
      expect(() => api.getLibraryBlockTypes('')).rejects.toThrow(err);
      // @ts-ignore
      expect(() => api.getLibraryBlockTypes()).rejects.toThrow(err);
    });
  });

  describe('getContentLibrary', () => {
    it('throws an error for invalid libraryId', () => {
      expect(api.getContentLibrary('')).rejects.toThrow('libraryId is required');
      // @ts-ignore
      expect(() => api.getContentLibrary()).rejects.toThrow('libraryId is required');
    });
  });

  describe('createLibraryBlock', () => {
    it('should create library block', async () => {
      const { axiosMock } = initializeMocks();
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

  describe('commitLibraryChanges', () => {
    it('should commit library changes', async () => {
      const { axiosMock } = initializeMocks();
      const libraryId = 'lib:org:1';
      const url = api.getCommitLibraryChangesUrl(libraryId);
      axiosMock.onPost(url).reply(200);

      await api.commitLibraryChanges(libraryId);

      expect(axiosMock.history.post[0].url).toEqual(url);
    });
  });

  describe('revertLibraryChanges', () => {
    it('should revert library changes', async () => {
      const { axiosMock } = initializeMocks();
      const libraryId = 'lib:org:1';
      const url = api.getCommitLibraryChangesUrl(libraryId);
      axiosMock.onDelete(url).reply(200);

      await api.revertLibraryChanges(libraryId);

      expect(axiosMock.history.delete[0].url).toEqual(url);
    });
  });
});
