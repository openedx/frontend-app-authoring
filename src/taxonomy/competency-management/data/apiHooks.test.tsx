import {
  act,
  initializeMocks,
  makeWrapper,
  renderHook,
  waitFor,
} from '@src/testUtils';
import { useUserPermissions } from '@src/authz/data/apiHooks';
import { waffleFlagDefaults } from '@src/data/api';
import * as apiHooks from '@src/data/apiHooks';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import { apiUrls } from './api';
import {
  competencyQueryKeys,
  useCompetencyCriteriaGroups,
  useCourseTaggingPermissions,
  useCreateCompetencyCriterion,
  useDefaultCompetencyRuleProfile,
  useUpdateCompetencyCriteriaGroupOperator,
  useUpdateCompetencyCriteriaRule,
} from './apiHooks';

jest.mock('@src/authz/data/apiHooks', () => ({
  useUserPermissions: jest.fn(),
}));

const tagId = 42;
const courseKeys = ['course-v1:OrgX+CS101+2024', 'course-v1:OrgX+CS102+2024'];

/** The criteria-groups wire body for no groups, and what the hook hands back for it once camel-cased. */
const emptyGroupsBody = { groups: [], criteria: [], criteria_count: 0, total_criteria_count: 0 };
const emptyGroupsData = { groups: [], criteria: [], criteriaCount: 0, totalCriteriaCount: 0 };

// Any criteria-groups request, whatever its tag id.
const criteriaGroupsRequests = (axiosMock: ReturnType<typeof initializeMocks>['axiosMock']) => (
  axiosMock.history.get.filter((req) => req.url?.includes('/criteria-groups/'))
);

/** Mounts the active groups query for `tagId` beside a mutation hook, and waits for the query's first load. */
const renderMutationWithActiveGroupsQuery = async <TMutation,>(useMutationHook: () => TMutation) => {
  const { result } = renderHook(
    () => ({ query: useCompetencyCriteriaGroups(tagId, courseKeys), mutation: useMutationHook() }),
    { wrapper: makeWrapper() },
  );
  await waitFor(() => expect(result.current.query.isSuccess).toBe(true));
  return result;
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useCompetencyCriteriaGroups', () => {
  it('fetches a competency\'s criteria groups, scoped to the given course keys', async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(200, emptyGroupsBody);

    const { result } = renderHook(() => useCompetencyCriteriaGroups(tagId, courseKeys), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(emptyGroupsData);
    expect(criteriaGroupsRequests(axiosMock)).toHaveLength(1);
    expect(criteriaGroupsRequests(axiosMock)[0].params).toEqual({ course_keys: courseKeys.join(',') });
  });

  it('issues no request, and stays pending rather than loading, until course keys are reported', async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(200, emptyGroupsBody);
    const { result, rerender } = renderHook(
      ({ keys }: { keys: string[] | undefined; }) => useCompetencyCriteriaGroups(tagId, keys),
      { wrapper: makeWrapper(), initialProps: { keys: undefined } },
    );

    expect(result.current.isPending).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toEqual('idle');
    expect(criteriaGroupsRequests(axiosMock)).toHaveLength(0);

    rerender({ keys: [] });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(criteriaGroupsRequests(axiosMock)).toHaveLength(1);
    expect(criteriaGroupsRequests(axiosMock)[0].params).toEqual({ course_keys: '' });
  });

  it('does not hand back the previous course keys\' data while new keys are fetching', async () => {
    const { axiosMock } = initializeMocks();
    const firstPageGroups = [{ id: 1 }];
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).replyOnce(200, {
      ...emptyGroupsBody,
      groups: firstPageGroups,
    });
    let releaseSecondPage: () => void = () => {};
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).replyOnce(() => (
      new Promise((resolve) => {
        releaseSecondPage = () => resolve([200, emptyGroupsBody]);
      })
    ));
    const { result, rerender } = renderHook(
      ({ keys }: { keys: string[]; }) => useCompetencyCriteriaGroups(tagId, keys),
      { wrapper: makeWrapper(), initialProps: { keys: [courseKeys[0]] } },
    );
    await waitFor(() => expect(result.current.data).toEqual({ ...emptyGroupsData, groups: firstPageGroups }));

    rerender({ keys: [courseKeys[1]] });

    await waitFor(() => expect(criteriaGroupsRequests(axiosMock)).toHaveLength(2));
    expect(criteriaGroupsRequests(axiosMock)[1].params).toEqual({ course_keys: courseKeys[1] });
    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toBeUndefined();

    await act(async () => {
      releaseSecondPage();
    });
    await waitFor(() => expect(result.current.data).toEqual(emptyGroupsData));
  });
});

describe('useDefaultCompetencyRuleProfile', () => {
  it('exposes the default rule profile fetched from the list endpoint', async () => {
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
    expect(result.current.data?.id).toEqual(1);
  });
});

describe('useCreateCompetencyCriterion', () => {
  it('refetches that tagId\'s active groups query on success', async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(200, emptyGroupsBody);
    axiosMock.onPost(apiUrls.createCompetencyCriterion(tagId)).reply(201, {
      id: 999,
      group_id: 10,
      rule_profile_id: 1,
      rule_type_override: null,
      rule_payload_override: null,
      object_tag_id: tagId,
    });
    const result = await renderMutationWithActiveGroupsQuery(useCreateCompetencyCriterion);

    await act(async () => {
      await result.current.mutation.mutateAsync({ tagId, payload: { object_id: 'block-a', group_id: 10 } });
    });

    // A second GET is the signal that a refetch was actually requested, not
    // suppressed - `useCreateCompetencyCriterion` must not pass
    // `refetchType: 'none'` (or similar) to `invalidateQueries`.
    await waitFor(() => expect(criteriaGroupsRequests(axiosMock)).toHaveLength(2));
  });

  it('drops an inactive scoped page from the cache and refetches the active one on success', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    const otherPageKey = competencyQueryKeys.competencyCriteriaGroups(tagId, ['course-v1:OrgX+CS201+2024']);
    queryClient.setQueryData(otherPageKey, { ...emptyGroupsData, totalCriteriaCount: 3 });
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId))
      .replyOnce(200, { ...emptyGroupsBody, total_criteria_count: 3 });
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId))
      .reply(200, { ...emptyGroupsBody, total_criteria_count: 4 });
    axiosMock.onPost(apiUrls.createCompetencyCriterion(tagId)).reply(201, {
      id: 999,
      group_id: 10,
      rule_profile_id: 1,
      rule_type_override: null,
      rule_payload_override: null,
      object_tag_id: tagId,
    });
    const result = await renderMutationWithActiveGroupsQuery(useCreateCompetencyCriterion);

    await act(async () => {
      await result.current.mutation.mutateAsync({ tagId, payload: { object_id: 'block-a', group_id: 10 } });
    });

    await waitFor(() => expect(result.current.query.data?.totalCriteriaCount).toBe(4));
    expect(queryClient.getQueryState(otherPageKey)).toBeUndefined();
  });

  it('stays pending until the groups refetch completes', async () => {
    const { axiosMock } = initializeMocks();
    const groupsUrl = apiUrls.competencyCriteriaGroups(tagId);
    let releaseRefetch!: () => void;
    const refetchGate = new Promise<void>((resolve) => {
      releaseRefetch = resolve;
    });
    axiosMock.onGet(groupsUrl).replyOnce(200, { groups: [], criteria: [] })
      .onGet(groupsUrl).reply(() => refetchGate.then(() => [200, { groups: [], criteria: [] }]));
    axiosMock.onPost(apiUrls.createCompetencyCriterion(tagId)).reply(201, {
      id: 999,
      group_id: 10,
      rule_profile_id: 1,
      rule_type_override: null,
      rule_payload_override: null,
      object_tag_id: tagId,
    });

    const { result } = renderHook(
      () => ({ groups: useCompetencyCriteriaGroups(tagId, courseKeys), create: useCreateCompetencyCriterion() }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.groups.isSuccess).toBe(true));

    act(() => {
      result.current.create.mutate({ tagId, payload: { object_id: 'block-a', group_id: 10 } });
    });
    await waitFor(() => expect(axiosMock.history.get).toHaveLength(2));

    expect(result.current.create.isPending).toBe(true);

    await act(async () => {
      releaseRefetch();
    });
    await waitFor(() => expect(result.current.create.isSuccess).toBe(true));
  });

  it('does not invalidate a different tagId\'s groups query', async () => {
    const { axiosMock, queryClient } = initializeMocks();
    const otherTagId = 7;
    axiosMock.onPost(apiUrls.createCompetencyCriterion(tagId)).reply(201, {
      id: 999,
      group_id: 10,
      rule_profile_id: 1,
      rule_type_override: null,
      rule_payload_override: null,
      object_tag_id: tagId,
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

describe('useUpdateCompetencyCriteriaGroupOperator', () => {
  it('refetches that tagId\'s active groups query on success', async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(200, emptyGroupsBody);
    axiosMock.onPatch(apiUrls.updateCompetencyCriteriaGroup(tagId, 10)).reply(200, {
      id: 10,
      parent_id: 1,
      tag_id: tagId,
      course_key: null,
      name: 'leaf',
      ordering: 0,
      logic_operator: 'OR',
      archived: false,
    });
    const result = await renderMutationWithActiveGroupsQuery(useUpdateCompetencyCriteriaGroupOperator);

    await act(async () => {
      await result.current.mutation.mutateAsync({ tagId, groupId: 10, logicOperator: 'OR' });
    });

    await waitFor(() => expect(criteriaGroupsRequests(axiosMock)).toHaveLength(2));
  });
});

describe('useUpdateCompetencyCriteriaRule', () => {
  it('refetches that tagId\'s active groups query on success', async () => {
    const { axiosMock } = initializeMocks();
    const groupId = 10;
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(200, emptyGroupsBody);
    axiosMock.onPatch(apiUrls.updateCompetencyCriteriaRule(groupId)).reply(200, [
      {
        id: 101,
        object_id: 'block-a',
        group_id: groupId,
        rule_profile_id: null,
        rule_type_override: 'grade',
        rule_payload_override: { op: 'gte', value: 0.8, scale: 'percent' },
      },
    ]);
    const result = await renderMutationWithActiveGroupsQuery(useUpdateCompetencyCriteriaRule);

    await act(async () => {
      await result.current.mutation.mutateAsync({
        tagId,
        groupId,
        criterionIds: [101],
        ruleType: 'grade',
        rulePayload: { op: 'gte', value: 0.8, scale: 'percent' },
      });
    });

    await waitFor(() => expect(criteriaGroupsRequests(axiosMock)).toHaveLength(2));
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

  it('resolves every course to false, with no permissions request, while the waffle flags are loading', () => {
    jest.spyOn(apiHooks, 'useWaffleFlags').mockImplementation(() => ({
      id: undefined,
      isLoading: true,
      isError: false,
      ...waffleFlagDefaults,
    }));

    const { result } = renderHook(
      () => useCourseTaggingPermissions(['course-a', 'course-b']),
      { wrapper: makeWrapper() },
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.permissionsByCourseId).toEqual({ 'course-a': false, 'course-b': false });
    expect(useUserPermissions).toHaveBeenCalledWith(expect.anything(), false);
  });

  it('reports an error when the flag is on and the permissions call failed', () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    jest.mocked(useUserPermissions).mockReturnValue({ isLoading: false, isError: true, data: undefined } as any);

    const { result } = renderHook(() => useCourseTaggingPermissions(['course-a']), { wrapper: makeWrapper() });

    expect(result.current.isError).toBe(true);
    expect(result.current.permissionsByCourseId).toEqual({ 'course-a': false });
  });

  it('reports no error when the flag is off, whatever the unused permissions query says', () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: false });
    jest.mocked(useUserPermissions).mockReturnValue({ isLoading: false, isError: true, data: undefined } as any);

    const { result } = renderHook(() => useCourseTaggingPermissions(['course-a']), { wrapper: makeWrapper() });

    expect(result.current.isError).toBe(false);
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

  it('keeps a course\'s earlier answer when a later permissions response omits it', async () => {
    mockWaffleFlags({ enableAuthzCourseAuthoring: true });
    jest.mocked(useUserPermissions).mockReturnValue({
      isLoading: false,
      data: { 'course-a': true, 'course-b': true },
    } as any);

    const { result, rerender } = renderHook(
      ({ courseIds }) => useCourseTaggingPermissions(courseIds),
      { wrapper: makeWrapper(), initialProps: { courseIds: ['course-a', 'course-b'] } },
    );
    await waitFor(() => {
      expect(result.current.permissionsByCourseId).toEqual({ 'course-a': true, 'course-b': true });
    });

    jest.mocked(useUserPermissions).mockReturnValue({ isLoading: false, data: { 'course-a': true } } as any);
    rerender({ courseIds: ['course-a', 'course-b'] });

    await waitFor(() => {
      expect(result.current.permissionsByCourseId).toEqual({ 'course-a': true, 'course-b': true });
    });
  });

  it(
    'keeps the first course\'s already-resolved answer while a second course is added to the query',
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

      // The second course's query is still in flight.
      jest.mocked(useUserPermissions).mockReturnValue({ isLoading: true, data: undefined } as any);
      rerender({ courseIds: ['course-a', 'course-b'] });

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
