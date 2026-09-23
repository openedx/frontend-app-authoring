jest.mock('CourseAuthoring/editors/data/services/cms/api', () => ({
  __esModule: true,
  default: {
    fetchStudioView: jest.fn(),
    fetchByUnitId: jest.fn(),
  },
}));
jest.mock('CourseAuthoring/course-unit/data/api', () => ({
  getCourseContainerChildren: jest.fn(),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

// eslint-disable-next-line import/no-unresolved
import cmsApi from 'CourseAuthoring/editors/data/services/cms/api';
// eslint-disable-next-line import/no-unresolved
import { getCourseContainerChildren } from 'CourseAuthoring/course-unit/data/api';
// eslint-disable-next-line import/no-unresolved
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
// eslint-disable-next-line import/no-unresolved
import { handlerUrl } from 'CourseAuthoring/editors/data/services/cms/urls';
import { fetchInVideoQuizData, saveInVideoQuizSettings, emptyInVideoQuizData } from './api';

const blockId = 'block-v1:org+course+run+type@invideoquiz+block@quiz-1';
const studioEndpointUrl = 'https://studio.local';

describe('fetchInVideoQuizData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads videos, problems, and quiz items from studio_view and unit data', async () => {
    const html = `
      <input id="xb-field-edit-video_id" value="video-1" />
      <textarea id="xb-field-edit-timemap">{"1:30": "problem-1"}</textarea>
      <textarea id="xb-field-edit-jump_back">{"1:30": "1:00"}</textarea>
    `;
    (cmsApi.fetchStudioView as jest.Mock).mockResolvedValue({ data: { html } });
    (cmsApi.fetchByUnitId as jest.Mock).mockResolvedValue({
      data: { ancestors: [{ category: 'vertical', id: 'unit-1' }] },
    });
    (getCourseContainerChildren as jest.Mock).mockResolvedValue({
      children: [
        { id: 'block-v1:org+course+run+type@video+block@video-1', blockType: 'video', name: 'Intro Video' },
        { id: 'block-v1:org+course+run+type@problem+block@problem-1', blockType: 'problem', name: 'Quiz 1' },
      ],
    });

    const result = await fetchInVideoQuizData({ blockId, studioEndpointUrl });

    expect(result.selectedVideo).toBe('video-1');
    expect(result.videos).toEqual([{ id: 'video-1', display_name: 'Intro Video' }]);
    expect(result.problems).toEqual([{ id: 'problem-1', display_name: 'Quiz 1' }]);
    expect(result.quizItems).toEqual([
      expect.objectContaining({ problemId: 'problem-1', time: '1:30', jumpBack: '1:00' }),
    ]);
  });

  it('sorts videos alphabetically', async () => {
    (cmsApi.fetchStudioView as jest.Mock).mockResolvedValue({ data: { html: '' } });
    (cmsApi.fetchByUnitId as jest.Mock).mockResolvedValue({
      data: { ancestors: [{ category: 'vertical', id: 'unit-1' }] },
    });
    (getCourseContainerChildren as jest.Mock).mockResolvedValue({
      children: [
        { id: 'block-v1:org+course+run+type@video+block@video-2', blockType: 'video', name: 'Zebra Video' },
        { id: 'block-v1:org+course+run+type@video+block@video-1', blockType: 'video', name: 'Alpha Video' },
      ],
    });

    const result = await fetchInVideoQuizData({ blockId, studioEndpointUrl });

    expect(result.videos).toEqual([
      { id: 'video-1', display_name: 'Alpha Video' },
      { id: 'video-2', display_name: 'Zebra Video' },
    ]);
  });

  it('returns empty data when the unit has no vertical ancestor', async () => {
    (cmsApi.fetchStudioView as jest.Mock).mockResolvedValue({ data: { html: '' } });
    (cmsApi.fetchByUnitId as jest.Mock).mockResolvedValue({ data: { ancestors: [] } });

    const result = await fetchInVideoQuizData({ blockId, studioEndpointUrl });

    expect(getCourseContainerChildren).not.toHaveBeenCalled();
    expect(result).toEqual(emptyInVideoQuizData);
  });

  it('returns empty data when the unit response has no ancestors field at all', async () => {
    (cmsApi.fetchStudioView as jest.Mock).mockResolvedValue({ data: { html: '' } });
    (cmsApi.fetchByUnitId as jest.Mock).mockResolvedValue({ data: {} });

    const result = await fetchInVideoQuizData({ blockId, studioEndpointUrl });

    expect(getCourseContainerChildren).not.toHaveBeenCalled();
    expect(result).toEqual(emptyInVideoQuizData);
  });

  it('returns empty data when the unit response has no data field at all', async () => {
    (cmsApi.fetchStudioView as jest.Mock).mockResolvedValue({ data: { html: '' } });
    (cmsApi.fetchByUnitId as jest.Mock).mockResolvedValue({});

    const result = await fetchInVideoQuizData({ blockId, studioEndpointUrl });

    expect(getCourseContainerChildren).not.toHaveBeenCalled();
    expect(result).toEqual(emptyInVideoQuizData);
  });

  it('rejects when fetching the unit fails', async () => {
    (cmsApi.fetchStudioView as jest.Mock).mockResolvedValue({ data: { html: '' } });
    (cmsApi.fetchByUnitId as jest.Mock).mockRejectedValue(new Error('unit fetch failed'));

    await expect(fetchInVideoQuizData({ blockId, studioEndpointUrl })).rejects.toThrow('unit fetch failed');
  });

  it('rejects when fetching the studio view fails', async () => {
    (cmsApi.fetchStudioView as jest.Mock).mockRejectedValue(new Error('studio view fetch failed'));
    (cmsApi.fetchByUnitId as jest.Mock).mockResolvedValue({
      data: { ancestors: [{ category: 'vertical', id: 'unit-1' }] },
    });

    await expect(fetchInVideoQuizData({ blockId, studioEndpointUrl })).rejects.toThrow('studio view fetch failed');
  });

  it('rejects when loading the unit children fails', async () => {
    (cmsApi.fetchStudioView as jest.Mock).mockResolvedValue({ data: { html: '' } });
    (cmsApi.fetchByUnitId as jest.Mock).mockResolvedValue({
      data: { ancestors: [{ category: 'vertical', id: 'unit-1' }] },
    });
    (getCourseContainerChildren as jest.Mock).mockRejectedValue(new Error('children fetch failed'));

    await expect(fetchInVideoQuizData({ blockId, studioEndpointUrl })).rejects.toThrow('children fetch failed');
  });

  it('recovers from malformed timemap JSON', async () => {
    const html = `
      <input id="xb-field-edit-video_id" value="video-1" />
      <textarea id="xb-field-edit-timemap">not valid json</textarea>
    `;
    (cmsApi.fetchStudioView as jest.Mock).mockResolvedValue({ data: { html } });
    (cmsApi.fetchByUnitId as jest.Mock).mockResolvedValue({
      data: { ancestors: [{ category: 'vertical', id: 'unit-1' }] },
    });
    (getCourseContainerChildren as jest.Mock).mockResolvedValue({ children: [] });

    const result = await fetchInVideoQuizData({ blockId, studioEndpointUrl });

    expect(result.quizItems).toEqual([]);
  });
});

describe('saveInVideoQuizSettings', () => {
  it('posts to the submit_studio_edits handler', async () => {
    const post = jest.fn().mockResolvedValue({ data: {} });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ post });

    await saveInVideoQuizSettings({
      blockId,
      studioEndpointUrl,
      displayName: 'In-video quiz',
      videoId: 'video-1',
      timemap: '{"1:30":"problem-1"}',
      jumpBack: '{"problem-1":"1:00"}',
    });

    expect(post).toHaveBeenCalledWith(
      handlerUrl({ studioEndpointUrl, blockId, handlerName: 'submit_studio_edits' }),
      {
        values: {
          display_name: 'In-video quiz',
          video_id: 'video-1',
          timemap: '{"1:30":"problem-1"}',
          jump_back: '{"problem-1":"1:00"}',
        },
        defaults: [],
      },
    );
  });
});
