import {
  act,
  initializeMocks,
  makeWrapper,
  renderHook,
  waitFor,
} from '@src/testUtils';
import { useUserPermissions } from '@src/authz/data/apiHooks';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { apiUrls } from './api';
import {
  competencyQueryKeys,
  useCompetencyCriteriaGroups,
  useCourseTaggingPermissions,
  useCreateCompetencyCriterion,
  useDefaultCompetencyRuleProfile,
} from './apiHooks';

jest.mock('@src/authz/data/apiHooks', () => ({
  useUserPermissions: jest.fn(),
}));

const tagId = 42;

describe('useCompetencyCriteriaGroups', () => {
  it('fetches a competency\'s criteria groups when tagId is defined', async () => {
    const { axiosMock } = initializeMocks();
    const mockResponse = { groups: [], criteria: [] };
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(200, mockResponse);

    const { result } = renderHook(() => useCompetencyCriteriaGroups(tagId), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockResponse);
  });

  it('issues no request, and reports not loading, while tagId is undefined', () => {
    const { axiosMock } = initializeMocks();
    const { result } = renderHook(() => useCompetencyCriteriaGroups(undefined), { wrapper: makeWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toEqual('idle');
    expect(axiosMock.history.get.filter((req) => req.url?.includes('competency_criteria_groups'))).toHaveLength(0);
  });
});

describe('useDefaultCompetencyRuleProfile', () => {
  it('fetches the studio-wide default rule profile out of the paginated list response', async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(apiUrls.defaultCompetencyRuleProfile()).reply(200, {
      count: 1,
      next: null,
      previous: null,
      results: [{
        id: 1,
        scope_type: 'system_default',
        rule_type: 'grade',
        rule_payload: { op: 'gte', value: 0.7, scale: 'percent' },
        archived: false,
      }],
    });

    const { result } = renderHook(() => useDefaultCompetencyRuleProfile(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      id: 1,
      scopeType: 'system_default',
      ruleType: 'grade',
      rulePayload: { op: 'gte', value: 0.7, scale: 'percent' },
      archived: false,
    });
  });

  it('picks the system_default row by scopeType, not array position, when a scoped profile is also present', async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(apiUrls.defaultCompetencyRuleProfile()).reply(200, {
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          id: 2,
          scope_type: 'taxonomy',
          rule_type: 'grade',
          rule_payload: { op: 'gte', value: 0.9, scale: 'percent' },
          archived: false,
        },
        {
          id: 1,
          scope_type: 'system_default',
          rule_type: 'grade',
          rule_payload: { op: 'gte', value: 0.7, scale: 'percent' },
          archived: false,
        },
      ],
    });

    const { result } = renderHook(() => useDefaultCompetencyRuleProfile(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({
      id: 1,
      scopeType: 'system_default',
      ruleType: 'grade',
      rulePayload: { op: 'gte', value: 0.7, scale: 'percent' },
      archived: false,
    });
  });
});

describe('useCreateCompetencyCriterion', () => {
  it('invalidates that tagId\'s groups query on success, without suppressing the refetch', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    axiosMock.onPost(apiUrls.createCompetencyCriterion(tagId)).reply(201, {
      id: 999,
      object_id: 'block-a',
      competency_criteria_group_id: 10,
      rule_profile_id: 1,
      rule_type_override: null,
      rule_payload_override: null,
    });
    queryClient.setQueryData(competencyQueryKeys.competencyCriteriaGroups(tagId), { groups: [], criteria: [] });

    const { result } = renderHook(() => useCreateCompetencyCriterion(), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ tagId, payload: { object_id: 'block-a', group_id: 10 } });
    });

    // `isInvalidated` (not `removeQueries`/a stale flag left permanently
    // `false`) is the signal that a refetch was actually requested, not
    // suppressed - `useCreateCompetencyCriterion` must not pass
    // `refetchType: 'none'` (or similar) to `invalidateQueries`.
    const state = queryClient.getQueryState(competencyQueryKeys.competencyCriteriaGroups(tagId));
    expect(state?.isInvalidated).toBe(true);
  });

  it('does not invalidate a different tagId\'s groups query', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    const otherTagId = 7;
    axiosMock.onPost(apiUrls.createCompetencyCriterion(tagId)).reply(201, {
      id: 999,
      object_id: 'block-a',
      competency_criteria_group_id: 10,
      rule_profile_id: 1,
      rule_type_override: null,
      rule_payload_override: null,
    });
    queryClient.setQueryData(competencyQueryKeys.competencyCriteriaGroups(otherTagId), { groups: [], criteria: [] });

    const { result } = renderHook(() => useCreateCompetencyCriterion(), { wrapper: makeWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ tagId, payload: { object_id: 'block-a', group_id: 10 } });
    });

    const state = queryClient.getQueryState(competencyQueryKeys.competencyCriteriaGroups(otherTagId));
    expect(state?.isInvalidated).toBe(false);
  });
});

describe('useCourseTaggingPermissions', () => {
  beforeEach(() => {
    initializeMocks();
    jest.mocked(useUserPermissions).mockReturnValue({ isLoading: false, data: undefined } as any);
  });

  it('issues no permissions request and reports not loading for an empty course-id list', () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });

    const { result } = renderHook(() => useCourseTaggingPermissions([]), { wrapper: makeWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.permissionsByCourseId).toEqual({});
    // `enabled: false` is what would keep the real hook from ever firing a
    // request - `useUserPermissions` itself is mocked here.
    expect(useUserPermissions).toHaveBeenCalledWith(expect.anything(), false);
  });

  it('resolves every course to true, with no permissions request, when the waffle flag is off', () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: false });

    const { result } = renderHook(
      () => useCourseTaggingPermissions(['course-a', 'course-b']),
      { wrapper: makeWrapper() },
    );

    expect(result.current.isAuthzEnabled).toBe(false);
    expect(result.current.permissionsByCourseId).toEqual({ 'course-a': true, 'course-b': true });
    expect(useUserPermissions).toHaveBeenCalledWith(expect.anything(), false);
  });

  it('resolves each course\'s own answer when the flag is on and the permissions call has resolved', async () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    jest.mocked(useUserPermissions).mockReturnValue({
      isLoading: false,
      data: { 'course-a': true, 'course-b': false },
    } as any);

    const { result } = renderHook(
      () => useCourseTaggingPermissions(['course-a', 'course-b']),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => {
      expect(result.current.permissionsByCourseId).toEqual({ 'course-a': true, 'course-b': false });
    });
  });

  it('resolves a course id absent from the permissions response to false, not a throw', async () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    jest.mocked(useUserPermissions).mockReturnValue({ isLoading: false, data: {} } as any);

    const { result } = renderHook(() => useCourseTaggingPermissions(['course-a']), { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(result.current.permissionsByCourseId).toEqual({ 'course-a': false });
    });
  });

  it(
    'expanding to a second course re-issues the query with both ids without losing the first course\'s '
      + 'already-resolved answer',
    async () => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      jest.mocked(useUserPermissions).mockReturnValue({
        isLoading: false,
        data: { 'course-a': true },
      } as any);

      const { result, rerender } = renderHook(
        ({ courseIds }) => useCourseTaggingPermissions(courseIds),
        { wrapper: makeWrapper(), initialProps: { courseIds: ['course-a'] } },
      );
      await waitFor(() => {
        expect(result.current.permissionsByCourseId).toEqual({ 'course-a': true });
      });

      // Expanding to a second course re-issues the query (a new query key,
      // since `useUserPermissions`'s cache key embeds the whole query
      // object) - still in flight, before it resolves.
      jest.mocked(useUserPermissions).mockReturnValue({ isLoading: true, data: undefined } as any);
      rerender({ courseIds: ['course-a', 'course-b'] });

      // Course A's already-resolved answer survives; course B - never
      // resolved yet - defaults to false while its own answer is pending.
      expect(result.current.permissionsByCourseId).toEqual({ 'course-a': true, 'course-b': false });

      jest.mocked(useUserPermissions).mockReturnValue({
        isLoading: false,
        data: { 'course-a': true, 'course-b': false },
      } as any);
      rerender({ courseIds: ['course-a', 'course-b'] });

      await waitFor(() => {
        expect(result.current.permissionsByCourseId).toEqual({ 'course-a': true, 'course-b': false });
      });
    },
  );
});
