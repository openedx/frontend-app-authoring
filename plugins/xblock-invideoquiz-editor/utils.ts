import { logError } from '@edx/frontend-platform/logging';
import type {
  QuizItem,
  Timemap,
  JumpBackMap,
  JumpBackInput,
  ParsedStudioView,
  TimemapValue,
} from './types';

export const extractBlockId = (fullBlockId: string): string => {
  const parts = fullBlockId.split('@');
  return parts[parts.length - 1];
};

export const isValidTimeFormat = (value: string): boolean => /^\d+:[0-5]\d$/.test(value);

/** Formats digits typed into a time field as M:SS, clamping seconds to 59. */
export const formatTimeInput = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) { return digits; }
  const seconds = Math.min(parseInt(digits.slice(-2), 10), 59);
  return `${digits.slice(0, -2)}:${String(seconds).padStart(2, '0')}`;
};

const generateQuizItemId = (): string => `problem-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

export const makeEmptyQuizItem = (): QuizItem => ({
  id: generateQuizItemId(),
  problemId: '',
  time: '',
  jumpBack: '',
});

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
      // A leading '{' means valid JSON can only parse to a non-null object
      // (or throw), so no extra type guard is needed on the result.
      try {
        return JSON.parse(trimmed) as JumpBackMap;
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
 * Normalize a timemap key to MM:SS. Older blocks (and the LMS player) also
 * accept a plain integer number of seconds (e.g. "90"); convert those to the
 * MM:SS format this editor's inputs and validation expect.
 */
export const normalizeTimeKey = (time: string): string => {
  if (time.includes(':')) {
    return time;
  }
  const totalSeconds = parseInt(time, 10);
  if (Number.isNaN(totalSeconds)) {
    return time;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
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
  return Object.entries(timemap).flatMap(([rawTime, problemValue]) => {
    const time = normalizeTimeKey(rawTime);
    return normalizeProblemIds(problemValue).map((problemId) => ({
      id: generateQuizItemId(),
      problemId,
      time,
      // Legacy time-keyed jump-back maps may still be keyed by the raw
      // (un-normalized) time string, so fall back to that if needed.
      jumpBack: resolveQuizItemJumpBack(jumpBackMap, problemId, time)
        || resolveQuizItemJumpBack(jumpBackMap, problemId, rawTime),
    }));
  });
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

/**
 * Parse studio_view HTML response to extract field values
 */
export const parseStudioViewHtml = (html: string): ParsedStudioView => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Extract video_id from input field
  const videoIdInput = doc.querySelector<HTMLInputElement>('#xb-field-edit-video_id');
  const videoId = videoIdInput ? videoIdInput.value : '';

  // Extract timemap from textarea
  const timemapTextarea = doc.querySelector<HTMLTextAreaElement>('#xb-field-edit-timemap');
  let timemap: Timemap = {};
  // jump_back is a single-line String field (unlike timemap's multiline_editor),
  // so studio_view renders it as an <input>, not a <textarea>.
  const jumpBackTextarea = doc.querySelector<HTMLInputElement | HTMLTextAreaElement>('#xb-field-edit-jump_back');
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
