jest.mock('./requests', () => ({
  fetchStudioView: jest.fn(),
  fetchUnit: jest.fn(),
}));
jest.mock('../../../../course-unit/data/api', () => ({
  getCourseContainerChildren: jest.fn(),
}));
jest.mock('../../services/cms/api', () => ({
  __esModule: true,
  default: { saveInVideoQuizSettings: jest.fn() },
}));
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

import {
  normalizeProblemIds,
  normalizeJumpBackField,
  resolveQuizItemJumpBack,
  parseJumpBackField,
  expandTimemapToQuizItems,
  buildTimemapFromQuizItems,
  buildJumpBackFromQuizItems,
  GLOBAL_JUMP_BACK_KEY,
  loadInVideoQuizSettings,
  saveInVideoQuizSettings,
} from './inVideoQuiz';
import * as requests from './requests';
import { getCourseContainerChildren } from '../../../../course-unit/data/api';
import api from '../../services/cms/api';
import { actions } from '../inVideoQuiz';
import { actions as requestsActions } from '../requests';
import { RequestKeys } from '../../constants/requests';

const flushPromises = () =>
  new Promise((resolve) => {
    setImmediate(resolve);
  });

/** Minimal fake dispatch that runs thunks the way redux-thunk middleware would. */
const makeDispatch = (getState?: () => any) => {
  const dispatch: any = jest.fn((action: any) => (
    typeof action === 'function' ? action(dispatch, getState) : action
  ));
  return dispatch;
};

describe('inVideoQuiz timemap helpers', () => {
  describe('normalizeProblemIds', () => {
    it('returns array for array input', () => {
      expect(normalizeProblemIds(['a', 'b'])).toEqual(['a', 'b']);
    });

    it('wraps string in array', () => {
      expect(normalizeProblemIds('problem-1')).toEqual(['problem-1']);
    });

    it('returns empty array for falsy input', () => {
      expect(normalizeProblemIds('')).toEqual([]);
      expect(normalizeProblemIds(null)).toEqual([]);
    });
  });

  describe('expandTimemapToQuizItems', () => {
    it('expands legacy single-problem timemap', () => {
      const items = expandTimemapToQuizItems({ '1:30': 'problem-1' }, { '1:30': '0:45' });
      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({
        problemId: 'problem-1',
        time: '1:30',
        jumpBack: '0:45',
      });
    });

    it('expands multi-problem timemap into separate rows', () => {
      const items = expandTimemapToQuizItems({
        '1:30': ['problem-1', 'problem-2'],
      });
      expect(items).toHaveLength(2);
      expect(items[0].problemId).toBe('problem-1');
      expect(items[1].problemId).toBe('problem-2');
      expect(items[0].time).toBe('1:30');
      expect(items[1].time).toBe('1:30');
    });

    it('assigns per-problem jump back for problems at the same timestamp', () => {
      const items = expandTimemapToQuizItems(
        { '1:30': ['problem-1', 'problem-2'] },
        { 'problem-1': '1:29', 'problem-2': '1:35' },
      );
      expect(items).toHaveLength(2);
      expect(items[0].jumpBack).toBe('1:29');
      expect(items[1].jumpBack).toBe('1:35');
    });

    it('falls back to legacy time-keyed jump back', () => {
      const items = expandTimemapToQuizItems(
        { '1:30': 'problem-1' },
        { '1:30': '1:00' },
      );
      expect(items[0].jumpBack).toBe('1:00');
    });

    it('applies legacy global jump back string to every problem row', () => {
      const items = expandTimemapToQuizItems(
        { '1:30': ['problem-1', 'problem-2'] },
        '1:29',
      );
      expect(items[0].jumpBack).toBe('1:29');
      expect(items[1].jumpBack).toBe('1:29');
    });
  });

  describe('normalizeJumpBackField', () => {
    it('wraps legacy global MM:SS string', () => {
      expect(normalizeJumpBackField('1:29')).toEqual({ [GLOBAL_JUMP_BACK_KEY]: '1:29' });
    });

    it('returns object maps unchanged', () => {
      expect(normalizeJumpBackField({ 'problem-1': '1:29' })).toEqual({
        'problem-1': '1:29',
      });
    });

    it('returns empty map for falsy input', () => {
      expect(normalizeJumpBackField('')).toEqual({});
      expect(normalizeJumpBackField(null)).toEqual({});
      expect(normalizeJumpBackField(undefined)).toEqual({});
    });

    it('returns empty map for whitespace-only string', () => {
      expect(normalizeJumpBackField('   ')).toEqual({});
    });

    it('parses a JSON object string into a per-problem map', () => {
      expect(normalizeJumpBackField('{"problem-1":"1:29"}')).toEqual({
        'problem-1': '1:29',
      });
    });

    it('returns empty map for malformed JSON-looking string', () => {
      expect(normalizeJumpBackField('{not valid json')).toEqual({});
    });

    it('returns empty map for a value that is neither string nor object', () => {
      expect(normalizeJumpBackField(42 as any)).toEqual({});
    });
  });

  describe('resolveQuizItemJumpBack', () => {
    it('prefers per-problem value over time and default', () => {
      const map = { 'problem-1': '1:29', '1:30': '1:00', [GLOBAL_JUMP_BACK_KEY]: '0:30' };
      expect(resolveQuizItemJumpBack(map, 'problem-1', '1:30')).toBe('1:29');
    });

    it('falls back to time-keyed legacy value', () => {
      expect(resolveQuizItemJumpBack({ '1:30': '1:00' }, 'problem-1', '1:30')).toBe('1:00');
    });

    it('falls back to global default', () => {
      expect(resolveQuizItemJumpBack({ [GLOBAL_JUMP_BACK_KEY]: '0:45' }, 'problem-1', '1:30')).toBe('0:45');
    });

    it('returns empty string for a falsy or non-object jump back map', () => {
      expect(resolveQuizItemJumpBack(null, 'problem-1', '1:30')).toBe('');
      expect(resolveQuizItemJumpBack(undefined, 'problem-1', '1:30')).toBe('');
    });
  });

  describe('parseJumpBackField', () => {
    it('parses per-problem JSON map', () => {
      expect(parseJumpBackField('{"problem-1":"1:29","problem-2":"1:45"}')).toEqual({
        'problem-1': '1:29',
        'problem-2': '1:45',
      });
    });

    it('parses legacy plain MM:SS string', () => {
      expect(parseJumpBackField('1:29')).toEqual({ [GLOBAL_JUMP_BACK_KEY]: '1:29' });
    });

    it('parses legacy time-keyed JSON map', () => {
      expect(parseJumpBackField('{"1:30":"1:29"}')).toEqual({ '1:30': '1:29' });
    });

    it('returns empty map for falsy input', () => {
      expect(parseJumpBackField('')).toEqual({});
      expect(parseJumpBackField(null)).toEqual({});
      expect(parseJumpBackField(undefined)).toEqual({});
    });

    it('returns empty map for whitespace-only input', () => {
      expect(parseJumpBackField('   ')).toEqual({});
    });

    it('normalizes a double-encoded JSON string', () => {
      expect(parseJumpBackField('"1:29"')).toEqual({ [GLOBAL_JUMP_BACK_KEY]: '1:29' });
    });
  });

  describe('buildTimemapFromQuizItems', () => {
    it('uses string value for single problem at a timestamp', () => {
      const timemap = buildTimemapFromQuizItems([
        { id: '1', problemId: 'problem-1', time: '1:30', jumpBack: '' },
        { id: '2', problemId: 'problem-2', time: '2:00', jumpBack: '' },
      ]);
      expect(timemap).toEqual({
        '1:30': 'problem-1',
        '2:00': 'problem-2',
      });
    });

    it('uses array value for multiple problems at the same timestamp', () => {
      const timemap = buildTimemapFromQuizItems([
        { id: '1', problemId: 'problem-1', time: '1:30', jumpBack: '' },
        { id: '2', problemId: 'problem-2', time: '1:30', jumpBack: '' },
      ]);
      expect(timemap).toEqual({
        '1:30': ['problem-1', 'problem-2'],
      });
    });
  });

  describe('buildJumpBackFromQuizItems', () => {
    it('stores a jump back value per problem, even at the same timestamp', () => {
      const jumpBack = buildJumpBackFromQuizItems([
        { id: '1', problemId: 'problem-1', time: '1:30', jumpBack: '0:30' },
        { id: '2', problemId: 'problem-2', time: '1:30', jumpBack: '0:45' },
      ]);
      expect(jumpBack).toEqual({
        'problem-1': '0:30',
        'problem-2': '0:45',
      });
    });

    it('omits problems without a jump back value', () => {
      const jumpBack = buildJumpBackFromQuizItems([
        { id: '1', problemId: 'problem-1', time: '1:30', jumpBack: '0:30' },
        { id: '2', problemId: 'problem-2', time: '1:30', jumpBack: '' },
      ]);
      expect(jumpBack).toEqual({ 'problem-1': '0:30' });
    });
  });
});

describe('loadInVideoQuizSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads videos, problems, and quiz items from studio_view and unit data', async () => {
    const html = `
      <input id="xb-field-edit-video_id" value="video-1" />
      <textarea id="xb-field-edit-timemap">{"1:30": "problem-1"}</textarea>
      <textarea id="xb-field-edit-jump_back">{"1:30": "1:00"}</textarea>
    `;

    (requests.fetchStudioView as jest.Mock).mockImplementation(({ onSuccess }: any) => (
      () => {
        onSuccess({ data: { html } });
      }
    ));
    (requests.fetchUnit as jest.Mock).mockImplementation(({ onSuccess }: any) => (
      () => {
        onSuccess({ data: { ancestors: [{ category: 'vertical', id: 'unit-1' }] } });
      }
    ));
    (getCourseContainerChildren as jest.Mock).mockResolvedValue({
      children: [
        { id: 'block-v1:org+course+run+type@video+block@video-1', blockType: 'video', name: 'Intro Video' },
        { id: 'block-v1:org+course+run+type@problem+block@problem-1', blockType: 'problem', name: 'Quiz 1' },
      ],
    });

    const dispatch = makeDispatch();
    loadInVideoQuizSettings()(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith(actions.setVideos([
      { id: 'video-1', display_name: 'Intro Video' },
    ]));
    expect(dispatch).toHaveBeenCalledWith(actions.setProblems([
      { id: 'problem-1', display_name: 'Quiz 1' },
    ]));
    expect(dispatch).toHaveBeenCalledWith(actions.setSelectedVideo('video-1'));
    expect(dispatch).toHaveBeenCalledWith(actions.setQuizItems([
      expect.objectContaining({ problemId: 'problem-1', time: '1:30', jumpBack: '1:00' }),
    ]));
    expect(dispatch).toHaveBeenCalledWith(actions.setUnitContentLoaded(true));
  });

  it('sorts videos alphabetically and recovers from malformed timemap JSON', async () => {
    const html = `
      <input id="xb-field-edit-video_id" value="video-1" />
      <textarea id="xb-field-edit-timemap">not valid json</textarea>
    `;

    (requests.fetchStudioView as jest.Mock).mockImplementation(({ onSuccess }: any) => (
      () => {
        onSuccess({ data: { html } });
      }
    ));
    (requests.fetchUnit as jest.Mock).mockImplementation(({ onSuccess }: any) => (
      () => {
        onSuccess({ data: { ancestors: [{ category: 'vertical', id: 'unit-1' }] } });
      }
    ));
    (getCourseContainerChildren as jest.Mock).mockResolvedValue({
      children: [
        { id: 'block-v1:org+course+run+type@video+block@video-2', blockType: 'video', name: 'Zebra Video' },
        { id: 'block-v1:org+course+run+type@video+block@video-1', blockType: 'video', name: 'Alpha Video' },
      ],
    });

    const dispatch = makeDispatch();
    loadInVideoQuizSettings()(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith(actions.setVideos([
      { id: 'video-1', display_name: 'Alpha Video' },
      { id: 'video-2', display_name: 'Zebra Video' },
    ]));
    expect(dispatch).toHaveBeenCalledWith(actions.setUnitContentLoaded(true));
  });

  it('completes the request with empty data when the unit has no vertical ancestor', async () => {
    (requests.fetchStudioView as jest.Mock).mockImplementation(({ onSuccess }: any) => (
      () => {
        onSuccess({ data: { html: '' } });
      }
    ));
    (requests.fetchUnit as jest.Mock).mockImplementation(({ onSuccess }: any) => (
      () => {
        onSuccess({ data: { ancestors: [] } });
      }
    ));

    const dispatch = makeDispatch();
    loadInVideoQuizSettings()(dispatch);
    await flushPromises();

    expect(getCourseContainerChildren).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(actions.setDirty(false));
    expect(dispatch).toHaveBeenCalledWith(actions.setUnitContentLoaded(true));
  });

  it('marks unit content as loaded when fetching the unit fails', async () => {
    (requests.fetchStudioView as jest.Mock).mockImplementation(({ onSuccess }: any) => (
      () => {
        onSuccess({ data: { html: '' } });
      }
    ));
    (requests.fetchUnit as jest.Mock).mockImplementation(({ onFailure }: any) => (
      () => {
        onFailure(new Error('unit fetch failed'));
      }
    ));

    const dispatch = makeDispatch();
    loadInVideoQuizSettings()(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith(actions.setUnitContentLoaded(true));
  });

  it('marks unit content as loaded when fetching the studio view fails', async () => {
    (requests.fetchStudioView as jest.Mock).mockImplementation(({ onFailure }: any) => (
      () => {
        onFailure(new Error('studio view fetch failed'));
      }
    ));

    const dispatch = makeDispatch();
    loadInVideoQuizSettings()(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith(actions.setUnitContentLoaded(true));
  });

  it('marks unit content as loaded when loading the unit children fails', async () => {
    (requests.fetchStudioView as jest.Mock).mockImplementation(({ onSuccess }: any) => (
      () => {
        onSuccess({ data: { html: '' } });
      }
    ));
    (requests.fetchUnit as jest.Mock).mockImplementation(({ onSuccess }: any) => (
      () => {
        onSuccess({ data: { ancestors: [{ category: 'vertical', id: 'unit-1' }] } });
      }
    ));
    (getCourseContainerChildren as jest.Mock).mockRejectedValue(new Error('children fetch failed'));

    const dispatch = makeDispatch();
    loadInVideoQuizSettings()(dispatch);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith(actions.setUnitContentLoaded(true));
  });
});

describe('saveInVideoQuizSettings', () => {
  const baseState = {
    inVideoQuiz: {
      selectedVideo: 'video-1',
      quizItems: [
        { id: '1', problemId: 'problem-1', time: '1:30', jumpBack: '1:00' },
      ],
    },
    app: {
      blockId: 'block-1',
      studioEndpointUrl: 'https://studio.example.com',
      blockTitle: 'My In-Video Quiz',
    },
  };
  const getState = () => baseState;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves settings and calls onSuccess', async () => {
    (api.saveInVideoQuizSettings as jest.Mock).mockResolvedValue({ data: 'ok' });
    const onSuccess = jest.fn();
    const dispatch = makeDispatch(getState);

    saveInVideoQuizSettings({ onSuccess })(dispatch, getState);
    await flushPromises();

    expect(api.saveInVideoQuizSettings).toHaveBeenCalledWith({
      studioEndpointUrl: 'https://studio.example.com',
      blockId: 'block-1',
      displayName: 'My In-Video Quiz',
      videoId: 'video-1',
      timemap: JSON.stringify({ '1:30': 'problem-1' }),
      jumpBack: JSON.stringify({ 'problem-1': '1:00' }),
    });
    expect(dispatch).toHaveBeenCalledWith(requestsActions.startRequest(RequestKeys.saveBlock));
    expect(dispatch).toHaveBeenCalledWith(actions.setDirty(false));
    expect(dispatch).toHaveBeenCalledWith(requestsActions.completeRequest({
      requestKey: RequestKeys.saveBlock,
      response: { data: 'ok' },
    }));
    expect(onSuccess).toHaveBeenCalledWith({ data: 'ok' });
  });

  it('calls onFailure and dispatches failRequest when saving fails', async () => {
    const error = new Error('save failed');
    (api.saveInVideoQuizSettings as jest.Mock).mockRejectedValue(error);
    const onFailure = jest.fn();
    const dispatch = makeDispatch(getState);

    saveInVideoQuizSettings({ onFailure })(dispatch, getState);
    await flushPromises();

    expect(dispatch).toHaveBeenCalledWith(requestsActions.failRequest({
      requestKey: RequestKeys.saveBlock,
      error,
    }));
    expect(onFailure).toHaveBeenCalledWith(error);
  });

  it('defaults blockTitle to an empty string when not set', async () => {
    (api.saveInVideoQuizSettings as jest.Mock).mockResolvedValue({ data: 'ok' });
    const stateWithoutTitle = {
      ...baseState,
      app: { ...baseState.app, blockTitle: null },
    };
    const dispatch = makeDispatch(() => stateWithoutTitle);

    saveInVideoQuizSettings()(dispatch, () => stateWithoutTitle);
    await flushPromises();

    expect(api.saveInVideoQuizSettings).toHaveBeenCalledWith(
      expect.objectContaining({ displayName: '' }),
    );
  });
});
