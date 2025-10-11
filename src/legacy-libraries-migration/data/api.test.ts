import { initializeMocks } from '../../testUtils';
import * as api from './api';

let axiosMock;

describe('legacy libraries migration API', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  describe('getMigrationStatus', () => {
    it('should get migration status', async () => {
      const migrationId = '1';
      const url = api.getMigrationStatusUrl(migrationId);
      axiosMock.onGet(url).reply(200);
      await api.getMigrationStatus(migrationId);

      expect(axiosMock.history.get[0].url).toEqual(url);
    });
  });

  describe('bulkMigrateLegacyLibraries', () => {
    it('should call bulk migrate legacy libraries', async () => {
      const url = api.bulkMigrateLegacyLibrariesUrl();
      axiosMock.onPost(url).reply(200);
      await api.bulkMigrateLegacyLibraries({
        sources: [],
        target: '1',
      });

      expect(axiosMock.history.post[0].url).toEqual(url);
    });
  });
});
