import { logError } from '@edx/frontend-platform/logging';
import { StrictDict } from '../../../utils';
import * as requests from './requests';
import { actions as inVideoQuizActions, selectors as inVideoQuizSelectors, type QuizItem } from '../inVideoQuiz';
import { actions as requestsActions } from '../requests';
import { selectors as appSelectors } from '../app';
import { RequestKeys } from '../../constants/requests';
import { getCourseContainerChildren } from '../../../../course-unit/data/api';
import api from '../../services/cms/api';

type TimemapValue = string | string[];
export type Timemap = Record<string, TimemapValue>;
export type JumpBackMap = Record<string, string>;
export type JumpBackInput = string | JumpBackMap | Record<string, never>;

const actions = {
  inVideoQuiz: inVideoQuizActions,
  requests: requestsActions,
};

const selectors = {
  app: appSelectors,
  inVideoQuiz: inVideoQuizSelectors,
};

const extractBlockId = (fullBlockId: string): string => {
  const parts = fullBlockId.split('@');
  return parts[parts.length - 1];
};

const generateQuizItemId = (): string => `problem-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

/** Internal map key for legacy global MM:SS jump-back values. */
export const GLOBAL_JUMP_BACK_KEY = 'globalJumpBack';

/**
 * Normalize timemap values that may be a single problem id or an array of ids.
 */
export const normalizeProblemIds = (value: TimemapValue | undefined | null): string[] => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  return value ? [value] : [];
};

/**
 * Normalize jump-back field from studio/API into a lookup map.
 * Supports legacy global MM:SS string, time-keyed map, and per-problem map.
 */
export const normalizeJumpBackField = (jumpBack: JumpBackInput | undefined | null): JumpBackMap => {
  if (!jumpBack) {
    return {};
  }
  if (typeof jumpBack === 'string') {
    const trimmed = jumpBack.trim();
    if (!trimmed) {
      return {};
    }
    if (trimmed.charAt(0) === '{') {
      try {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed === 'string') {
          return { [GLOBAL_JUMP_BACK_KEY]: parsed };
        }
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
      } catch {
        return {};
      }
    }
    return { [GLOBAL_JUMP_BACK_KEY]: trimmed };
  }
  if (typeof jumpBack === 'object') {
    return jumpBack as JumpBackMap;
  }
  return {};
};

/**
 * Resolve jump-back for a quiz item row from normalized jump-back data.
 */
export const resolveQuizItemJumpBack = (
  jumpBackMap: JumpBackMap | undefined | null,
  problemId: string,
  time: string,
): string => {
  if (!jumpBackMap || typeof jumpBackMap !== 'object') {
    return '';
  }
  return jumpBackMap[problemId] || jumpBackMap[time] || jumpBackMap[GLOBAL_JUMP_BACK_KEY] || '';
};

/**
 * Expand timemap JSON into editor quiz item rows.
 * Supports legacy {"1:30": "id1"} and multi-problem {"1:30": ["id1", "id2"]}.
 */
export const expandTimemapToQuizItems = (
  timemap: Timemap,
  jumpBack: JumpBackInput = {},
): QuizItem[] => {
  const jumpBackMap = normalizeJumpBackField(jumpBack);
  return Object.entries(timemap).flatMap(([time, problemValue]) => (
    normalizeProblemIds(problemValue).map((problemId) => ({
      id: generateQuizItemId(),
      problemId,
      time,
      jumpBack: resolveQuizItemJumpBack(jumpBackMap, problemId, time),
    }))
  ));
};

/**
 * Group quiz items into timemap JSON for save.
 * Single problems stay as strings; multiple problems at one time become arrays.
 */
export const buildTimemapFromQuizItems = (quizItems: QuizItem[]): Timemap => {
  const groups = quizItems.reduce((acc: Record<string, string[]>, item) => {
    if (item.problemId && item.time) {
      if (!acc[item.time]) {
        acc[item.time] = [];
      }
      acc[item.time].push(item.problemId);
    }
    return acc;
  }, {});

  return Object.entries(groups).reduce((acc: Timemap, [time, problemIds]) => {
    acc[time] = problemIds.length === 1 ? problemIds[0] : problemIds;
    return acc;
  }, {});
};

/**
 * Build jump-back map keyed by problem id so multiple problems sharing the same
 * timestamp can each keep their own jump-back value.
 */
export const buildJumpBackFromQuizItems = (quizItems: QuizItem[]): JumpBackMap => (
  quizItems.reduce((acc: JumpBackMap, item) => {
    if (item.problemId && item.jumpBack) {
      acc[item.problemId] = item.jumpBack;
    }
    return acc;
  }, {})
);

/**
 * Parse jump_back textarea value from studio_view HTML.
 * Supports JSON maps and legacy plain MM:SS strings.
 */
export const parseJumpBackField = (value: string | undefined | null): JumpBackMap => {
  if (!value) {
    return {};
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return {};
  }
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === 'string') {
      return normalizeJumpBackField(parsed);
    }
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return normalizeJumpBackField(trimmed);
  }
};

interface ParsedStudioView {
  videoId: string;
  timemap: Timemap;
  jumpBack: JumpBackMap;
}

/**
 * Parse studio_view HTML response to extract field values
 */
const parseStudioViewHtml = (html: string): ParsedStudioView => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Extract video_id from input field
  const videoIdInput = doc.querySelector<HTMLInputElement>('#xb-field-edit-video_id');
  const videoId = videoIdInput ? videoIdInput.value : '';

  // Extract timemap from textarea
  const timemapTextarea = doc.querySelector<HTMLTextAreaElement>('#xb-field-edit-timemap');
  let timemap: Timemap = {};
  const jumpBackTextarea = doc.querySelector<HTMLTextAreaElement>('#xb-field-edit-jump_back');
  let jumpBack: JumpBackMap = {};

  const decodeStudioValue = (value: string): string => (
    value
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
  );

  if (timemapTextarea && timemapTextarea.value) {
    try {
      // The value might be HTML-encoded JSON, so we need to decode it
      const decodedValue = decodeStudioValue(timemapTextarea.value);
      timemap = JSON.parse(decodedValue);
    } catch (error) {
      logError('Failed to parse timemap data', error as Error);
      // Return empty timemap on parse error to prevent app crash
      timemap = {};
    }
  }

  if (jumpBackTextarea && jumpBackTextarea.value) {
    const decodedValue = decodeStudioValue(jumpBackTextarea.value);
    jumpBack = parseJumpBackField(decodedValue);
  }

  return { videoId, timemap, jumpBack };
};

export const loadInVideoQuizSettings = () => (dispatch: any) => {
  dispatch(actions.requests.startRequest(RequestKeys.fetchBlock));

  // First, fetch the studio_view to get the current form values
  dispatch(requests.fetchStudioView({
    onSuccess: (studioViewResponse: { data: { html: string; }; }) => {
      const { videoId, timemap, jumpBack } = parseStudioViewHtml(studioViewResponse.data.html);

      // Then fetch the unit data to populate videos and problems dropdowns
      dispatch(requests.fetchUnit({
        onSuccess: (response: { data: { ancestors?: { category: string; id: string; }[]; }; }) => {
          const ancestors = response.data?.ancestors || [];
          const unitAncestor = ancestors.find((ancestor) => ancestor.category === 'vertical');

          if (!unitAncestor) {
            dispatch(actions.inVideoQuiz.setDirty(false));
            dispatch(actions.inVideoQuiz.setUnitContentLoaded(true));
            dispatch(actions.requests.completeRequest({
              requestKey: RequestKeys.fetchBlock,
              response: { data: {} },
            }));
            return;
          }

          const unitId = unitAncestor.id;

          getCourseContainerChildren(unitId)
            .then((data) => {
              const videos = data.children
                .filter((component) => component.blockType === 'video')
                .map((video) => ({
                  id: extractBlockId(video.id),
                  display_name: video.name,
                }))
                .sort((a, b) => a.display_name.localeCompare(b.display_name));

              const problems = data.children
                .filter((component) => component.blockType === 'problem')
                .map((problem) => ({
                  id: extractBlockId(problem.id),
                  display_name: problem.name,
                }));

              dispatch(actions.inVideoQuiz.setVideos(videos));
              dispatch(actions.inVideoQuiz.setProblems(problems));

              // Set the selected video from the studio_view data
              if (videoId) {
                dispatch(actions.inVideoQuiz.setSelectedVideo(videoId));
              }

              // Parse timemap and populate quiz items.
              // Legacy: {"1:30": "problemId1"}
              // Multi-problem: {"1:30": ["problemId1", "problemId2"]}
              const quizItems = expandTimemapToQuizItems(timemap, jumpBack);

              if (quizItems.length > 0) {
                dispatch(actions.inVideoQuiz.setQuizItems(quizItems));
              }

              dispatch(actions.inVideoQuiz.setDirty(false));
              dispatch(actions.inVideoQuiz.setUnitContentLoaded(true));
              dispatch(actions.requests.completeRequest({
                requestKey: RequestKeys.fetchBlock,
                response: { data },
              }));
            })
            .catch((error: Error) => {
              dispatch(actions.inVideoQuiz.setUnitContentLoaded(true));
              dispatch(actions.requests.failRequest({
                requestKey: RequestKeys.fetchBlock,
                error,
              }));
            });
        },
        onFailure: (error: Error) => {
          dispatch(actions.inVideoQuiz.setUnitContentLoaded(true));
          dispatch(actions.requests.failRequest({
            requestKey: RequestKeys.fetchBlock,
            error,
          }));
        },
      }));
    },
    onFailure: (error: Error) => {
      dispatch(actions.inVideoQuiz.setUnitContentLoaded(true));
      dispatch(actions.requests.failRequest({
        requestKey: RequestKeys.fetchBlock,
        error,
      }));
    },
  }));
};

export interface SaveOptions {
  onSuccess?: (response: unknown) => void;
  onFailure?: (error: Error) => void;
}

/**
 * Save in-video quiz settings to the backend
 */
export const saveInVideoQuizSettings = (
  { onSuccess, onFailure }: SaveOptions = {},
) =>
(dispatch: any, getState: any) => {
  const state = getState();
  const selectedVideo = selectors.inVideoQuiz.selectedVideo(state);
  const quizItems: QuizItem[] = selectors.inVideoQuiz.quizItems(state);
  const blockId = selectors.app.blockId(state);
  const studioEndpointUrl = selectors.app.studioEndpointUrl(state);
  const displayName = selectors.app.blockTitle(state) || '';

  const timemapObject = buildTimemapFromQuizItems(quizItems);
  const jumpBackObject = buildJumpBackFromQuizItems(quizItems);

  // Convert timemap object to JSON string
  const timemapString = JSON.stringify(timemapObject);
  const jumpBackString = JSON.stringify(jumpBackObject);

  dispatch(actions.requests.startRequest(RequestKeys.saveBlock));

  api.saveInVideoQuizSettings({
    studioEndpointUrl,
    blockId,
    displayName,
    videoId: selectedVideo || '',
    timemap: timemapString,
    jumpBack: jumpBackString,
  })
    .then((response: unknown) => {
      dispatch(actions.inVideoQuiz.setDirty(false));
      dispatch(actions.requests.completeRequest({
        requestKey: RequestKeys.saveBlock,
        response,
      }));
      if (onSuccess) {
        onSuccess(response);
      }
    })
    .catch((error: Error) => {
      dispatch(actions.requests.failRequest({
        requestKey: RequestKeys.saveBlock,
        error,
      }));
      if (onFailure) {
        onFailure(error);
      }
    });
};

export default StrictDict({
  loadInVideoQuizSettings,
  saveInVideoQuizSettings,
});
