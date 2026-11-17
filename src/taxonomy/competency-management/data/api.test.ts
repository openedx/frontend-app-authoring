import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMocks } from '@src/testUtils';
import {
  apiUrls,
  createCompetencyCriterion,
  getCompetencyCriteriaGroups,
  getDefaultCompetencyRuleProfile,
  updateCompetencyCriteriaGroupOperator,
  updateCompetencyCriteriaRule,
} from './api';
import type { CompetencyCriteriaGroupsResponse } from './types';

const tagId = 42;
const emptyGroupsBody = { groups: [], criteria: [], criteria_count: 0, total_criteria_count: 0 };

/** The `course_keys` value as it appears in the serialized request URL, or `null` when the param is absent. */
const sentCourseKeysParam = (request: Parameters<ReturnType<typeof getAuthenticatedHttpClient>['getUri']>[0]) => (
  new URL(getAuthenticatedHttpClient().getUri(request)).searchParams.get('course_keys')
);

describe('competency-management api calls', () => {
  it('gets a competency\'s criteria groups', async () => {
    const { axiosMock } = initializeMocks();
    // Distinct, nonzero counts, so a missed or swapped camel-casing of either one fails the test.
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(200, {
      groups: [],
      criteria: [],
      criteria_count: 2,
      total_criteria_count: 5,
    });
    const expected: CompetencyCriteriaGroupsResponse = {
      groups: [],
      criteria: [],
      criteriaCount: 2,
      totalCriteriaCount: 5,
    };

    const result = await getCompetencyCriteriaGroups(tagId, ['course-v1:OrgX+CS101+2024']);

    expect(axiosMock.history.get[0].url).toEqual(apiUrls.competencyCriteriaGroups(tagId));
    expect(result).toEqual(expected);
  });

  it('sends the course keys as one comma-separated course_keys param, in the order given', async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(200, emptyGroupsBody);
    // Deliberately not sorted, so a sort anywhere on the way out would show.
    const courseKeys = ['course-v1:OrgX+CS301+2024', 'course-v1:OrgX+CS101+2024', 'course-v1:OrgX+CS201+2024'];

    await getCompetencyCriteriaGroups(tagId, courseKeys);

    const request = axiosMock.history.get[0];
    expect(request.params).toEqual({ course_keys: courseKeys.join(',') });
    expect(sentCourseKeysParam(request)).toEqual(courseKeys.join(','));
  });

  it('still sends course_keys, as an empty value, for an empty list', async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(200, emptyGroupsBody);

    await getCompetencyCriteriaGroups(tagId, []);

    const request = axiosMock.history.get[0];
    expect(request.params).toEqual({ course_keys: '' });
    // Omitting the param would mean "unscoped" to the backend; an empty value means "no listed courses".
    expect(sentCourseKeysParam(request)).toEqual('');
  });

  it('gets the default competency rule profile out of the paginated list response, camelCased', async () => {
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

    const result = await getDefaultCompetencyRuleProfile();

    expect(axiosMock.history.get[0].url).toEqual(apiUrls.defaultCompetencyRuleProfile());
    expect(result).toEqual({
      id: 1,
      scopeType: 'system_default',
      ruleType: 'grade',
      rulePayload: { op: 'gte', value: 0.7, scale: 'percent' },
      archived: false,
    });
  });

  it('picks the system_default row by scopeType, not by array position, when other-scoped rows are present', async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(apiUrls.defaultCompetencyRuleProfile()).reply(200, {
      count: 2,
      next: null,
      previous: null,
      results: [
        // A scoped profile ordered *before* the system default - a
        // position-based pick (e.g. `results[0]`) would wrongly return this.
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

    const result = await getDefaultCompetencyRuleProfile();

    expect(result).toEqual({
      id: 1,
      scopeType: 'system_default',
      ruleType: 'grade',
      rulePayload: { op: 'gte', value: 0.7, scale: 'percent' },
      archived: false,
    });
  });

  it('throws when no system_default row is present, rather than returning an arbitrary row', async () => {
    const { axiosMock } = initializeMocks();
    axiosMock.onGet(apiUrls.defaultCompetencyRuleProfile()).reply(200, {
      count: 1,
      next: null,
      previous: null,
      results: [{
        id: 2,
        scope_type: 'taxonomy',
        rule_type: 'grade',
        rule_payload: { op: 'gte', value: 0.9, scale: 'percent' },
        archived: false,
      }],
    });

    await expect(getDefaultCompetencyRuleProfile()).rejects.toThrow(
      'No system_default competency rule profile was found in the rule_profiles response.',
    );
  });

  it('creates a new criterion, sending a snake_case payload and camelCasing the response', async () => {
    const { axiosMock } = initializeMocks();
    const payload = { object_id: 'block-a', group_id: 10 };
    axiosMock.onPost(apiUrls.createCompetencyCriterion(tagId)).reply(201, {
      id: 999,
      group_id: 10,
      rule_profile_id: 1,
      rule_type_override: null,
      rule_payload_override: null,
      object_tag_id: tagId,
    });

    const result = await createCompetencyCriterion(tagId, payload);

    expect(axiosMock.history.post[0].url).toEqual(apiUrls.createCompetencyCriterion(tagId));
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual(payload);
    expect(result).toEqual({
      id: 999,
      groupId: 10,
      ruleProfileId: 1,
      ruleTypeOverride: null,
      rulePayloadOverride: null,
      objectTagId: tagId,
    });
  });

  it('passes a new criterion\'s logic_operator through unchanged', async () => {
    const { axiosMock } = initializeMocks();
    const payload = { object_id: 'block-a', logic_operator: 'OR' as const };
    axiosMock.onPost(apiUrls.createCompetencyCriterion(tagId)).reply(201, {
      id: 1000,
      group_id: 11,
      rule_profile_id: 1,
      rule_type_override: null,
      rule_payload_override: null,
      object_tag_id: tagId,
    });

    await createCompetencyCriterion(tagId, payload);

    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual(payload);
  });

  it('updates a group\'s operator at its URL, sending a snake_case body and camelCasing the response', async () => {
    const { axiosMock } = initializeMocks();
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

    const result = await updateCompetencyCriteriaGroupOperator(tagId, 10, 'OR');

    expect(axiosMock.history.patch[0].url).toEqual(apiUrls.updateCompetencyCriteriaGroup(tagId, 10));
    expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({ logic_operator: 'OR' });
    expect(result).toEqual({
      id: 10,
      parentId: 1,
      tagId,
      courseKey: null,
      name: 'leaf',
      ordering: 0,
      logicOperator: 'OR',
      archived: false,
    });
  });

  it('batch-updates a rule box\'s score at its URL, sending a snake_case payload and camelCasing the response', async () => {
    const { axiosMock } = initializeMocks();
    const groupId = 10;
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

    const result = await updateCompetencyCriteriaRule(
      groupId,
      [101],
      'grade',
      { op: 'gte', value: 0.8, scale: 'percent' },
    );

    expect(axiosMock.history.patch[0].url).toEqual(apiUrls.updateCompetencyCriteriaRule(groupId));
    expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({
      criterion_ids: [101],
      rule_type_override: 'grade',
      rule_payload_override: { op: 'gte', value: 0.8, scale: 'percent' },
    });
    expect(result).toEqual([
      {
        id: 101,
        objectId: 'block-a',
        groupId,
        ruleProfileId: null,
        ruleTypeOverride: 'grade',
        rulePayloadOverride: { op: 'gte', value: 0.8, scale: 'percent' },
      },
    ]);
  });
});
