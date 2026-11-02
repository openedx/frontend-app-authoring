import type MockAdapter from 'axios-mock-adapter';
import { apiUrls } from '../data/api';

/** Answers the first GET of `tagId`'s criteria groups with the response body `initial`, then holds every later one until
 * `release` answers it with the body `refetched`. Replaces a reply already registered for that URL, such as a `beforeEach` default.
 */
export const mockHeldGroupsRefetch = (
  axiosMock: MockAdapter,
  tagId: number,
  initial: object,
  refetched: object,
) => {
  const control = { release: () => {} };
  let reads = 0;
  axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(() => {
    reads += 1;
    return reads === 1
      ? [200, initial]
      : new Promise((resolve) => {
        control.release = () => resolve([200, refetched]);
      });
  });
  return control;
};
