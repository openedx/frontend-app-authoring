import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
// eslint-disable-next-line import/no-unresolved
import cmsApi from 'CourseAuthoring/editors/data/services/cms/api';
// eslint-disable-next-line import/no-unresolved
import { handlerUrl } from 'CourseAuthoring/editors/data/services/cms/urls';
// eslint-disable-next-line import/no-unresolved
import { getCourseContainerChildren } from 'CourseAuthoring/course-unit/data/api';
import {
  extractBlockId,
  expandTimemapToQuizItems,
  parseStudioViewHtml,
} from '../utils';
import type { InVideoQuizData } from '../types';

export const emptyInVideoQuizData: InVideoQuizData = {
  selectedVideo: null,
  videos: [],
  problems: [],
  quizItems: [],
};

interface FetchParams {
  blockId: string;
  studioEndpointUrl: string;
}

/**
 * Loads studio_view + the unit's video/problem children and shapes them into
 * the editor's data. A block with no parent unit resolves to empty data
 * (the "Content not found" alert): that's a legitimate empty result, not a
 * failure. Any other failure rejects, so the editor shows a load-error state
 * instead of misrepresenting a load failure as an empty unit.
 */
export const fetchInVideoQuizData = async ({ blockId, studioEndpointUrl }: FetchParams): Promise<InVideoQuizData> => {
  const [studioViewResponse, unitResponse] = await Promise.all([
    cmsApi.fetchStudioView({ studioEndpointUrl, blockId }),
    cmsApi.fetchByUnitId({ blockId, studioEndpointUrl }),
  ]);
  const { videoId, timemap, jumpBack } = parseStudioViewHtml(studioViewResponse.data.html);
  const ancestors: { category: string; id: string; }[] = unitResponse.data?.ancestors || [];

  const unitAncestor = ancestors.find((ancestor) => ancestor.category === 'vertical');
  if (!unitAncestor) {
    return emptyInVideoQuizData;
  }

  const data = await getCourseContainerChildren(unitAncestor.id);
  const videos = data.children
    .filter((component) => component.blockType === 'video')
    .map((video) => ({ id: extractBlockId(video.id), display_name: video.name }))
    .sort((a, b) => a.display_name.localeCompare(b.display_name));
  const problems = data.children
    .filter((component) => component.blockType === 'problem')
    .map((problem) => ({ id: extractBlockId(problem.id), display_name: problem.name }));

  return {
    selectedVideo: videoId || null,
    videos,
    problems,
    quizItems: expandTimemapToQuizItems(timemap, jumpBack),
  };
};

export interface SaveVariables {
  blockId: string;
  studioEndpointUrl: string;
  displayName: string;
  videoId: string;
  timemap: string;
  jumpBack: string;
}

export const saveInVideoQuizSettings = ({
  blockId,
  studioEndpointUrl,
  displayName,
  videoId,
  timemap,
  jumpBack,
}: SaveVariables) =>
  getAuthenticatedHttpClient().post(
    handlerUrl({ studioEndpointUrl, blockId, handlerName: 'submit_studio_edits' }),
    {
      values: {
        display_name: displayName,
        video_id: videoId,
        timemap,
        jump_back: jumpBack,
      },
      defaults: [],
    },
  );
