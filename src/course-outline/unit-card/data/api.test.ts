import { initializeMocks } from '@src/testUtils';
import { getUnitHandler, getUnitHandlerApiUrl } from './api';

// Mock unit handler API response in snake_case (as returned by Django)
const mockUnitHandlerResponse = {
  unit_id: 'block-v1:edX+DemoX+Demo+type@vertical+block@abc123',
  display_name: 'Test Unit',
  components: [
    { block_id: 'block-v1:edX+DemoX+Demo+type@html+block@1', block_type: 'html', display_name: 'Text' },
    { block_id: 'block-v1:edX+DemoX+Demo+type@video+block@2', block_type: 'video', display_name: 'Video' },
  ],
};

describe('unit-card data/api', () => {
  let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  describe('getUnitHandlerApiUrl', () => {
    it('builds the correct URL for the given unitId', () => {
      const unitId = 'block-v1:edX+DemoX+Demo+type@vertical+block@abc123';
      const url = getUnitHandlerApiUrl(unitId);
      // URL should end with the unit handler path + unitId
      expect(url).toContain(`/api/contentstore/v1/unit_handler/${unitId}`);
    });
  });

  describe('getUnitHandler', () => {
    const unitId = 'block-v1:edX+DemoX+Demo+type@vertical+block@abc123';

    it('fetches unit data and returns camelCase response', async () => {
      // Mock the GET request for unit handler
      axiosMock.onGet(getUnitHandlerApiUrl(unitId)).reply(200, mockUnitHandlerResponse);

      const result = await getUnitHandler(unitId);

      // Should have made exactly one GET request
      expect(axiosMock.history.get).toHaveLength(1);
      expect(axiosMock.history.get[0].url).toEqual(getUnitHandlerApiUrl(unitId));

      // Response should be camelCased
      expect(result.unitId).toBe(mockUnitHandlerResponse.unit_id);
      expect(result.displayName).toBe(mockUnitHandlerResponse.display_name);
      expect(result.components).toHaveLength(2);
      expect(result.components[0].blockType).toBe('html');
    });

    it('throws on network error', async () => {
      // Simulate a network failure
      axiosMock.onGet(getUnitHandlerApiUrl(unitId)).networkError();

      await expect(getUnitHandler(unitId)).rejects.toThrow();
    });
  });
});
