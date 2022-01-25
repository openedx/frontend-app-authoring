import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { ActionStates, normalizeContent } from './constants';

async function getAsync(updateContext, params) {
  try {
    updateContext.setLoading(ActionStates.IN_PROGRESS);
    const result = await getAuthenticatedHttpClient().get(...params);
    updateContext.setValue(result);
  } catch (e) {
    updateContext.setError(e);
  } finally {
    updateContext.setLoading(ActionStates.FINISHED);
  }
}

async function saveAsync(updateContext, params) {
  try {
    const result = await getAuthenticatedHttpClient().post(...params);
    updateContext.setResponse(result);
  } catch (e) {
    updateContext.setResponse(e);
  } finally {
    updateContext.setInProgress(ActionStates.FINISHED);
  }
}

export async function fetchBlockById(updateContext, blockId, studioEndpointUrl) {
  const url = `${studioEndpointUrl}/xblock/${blockId}`;
  getAsync(updateContext, [url]);
}

export async function fetchUnitById(updateContext, blockId, studioEndpointUrl) {
  const url = `${studioEndpointUrl}/xblock/${blockId}?fields=ancestorInfo`;
  getAsync(updateContext, [url]);
}

export async function saveBlock(blockId, blockType, courseId, studioEndpointUrl, content, updateContext) {
  const normalizedContent = normalizeContent(blockType, content, blockId, courseId);
  const url = `${studioEndpointUrl}/xblock/${encodeURI(blockId)}`;
  const params = [url, normalizedContent];
  saveAsync(updateContext, params);
}
