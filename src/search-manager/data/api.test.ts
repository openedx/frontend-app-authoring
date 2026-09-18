import { initializeMocks } from '@src/testUtils';
import { getContentSearchConfig, getContentSearchConfigUrl } from './api';

describe('getContentSearchConfig', () => {
  it('returns the separate course and library indexes', async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(getContentSearchConfigUrl()).reply(200, {
      url: 'http://mock.meilisearch.local',
      index_name: 'studio_course',
      course_index_name: 'studio_course',
      library_index_name: 'studio_library',
      api_key: 'test-key',
    });

    expect(await getContentSearchConfig()).toEqual({
      url: 'http://mock.meilisearch.local',
      courseIndexName: 'studio_course',
      libraryIndexName: 'studio_library',
      apiKey: 'test-key',
    });
  });

  it('falls back to index_name for both when the backend has a single index', async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(getContentSearchConfigUrl()).reply(200, {
      url: 'http://mock.meilisearch.local',
      index_name: 'studio_content',
      api_key: 'test-key',
    });

    expect(await getContentSearchConfig()).toEqual({
      url: 'http://mock.meilisearch.local',
      courseIndexName: 'studio_content',
      libraryIndexName: 'studio_content',
      apiKey: 'test-key',
    });
  });
});
