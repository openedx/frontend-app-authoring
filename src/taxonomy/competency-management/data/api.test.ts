import { initializeMocks } from '@src/testUtils';
import {
  apiUrls,
  createCompetencyCriterion,
  getCompetencyCriteriaGroups,
  getDefaultCompetencyRuleProfile,
} from './api';
import type { CompetencyCriteriaGroupsResponse } from './types';

const tagId = 42;

describe('competency-management api calls', () => {
  it('gets a competency\'s criteria groups', async () => {
    const { axiosMock } = initializeMocks();
    const mockResponse: CompetencyCriteriaGroupsResponse = { groups: [], criteria: [] };
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(200, mockResponse);

    const result = await getCompetencyCriteriaGroups(tagId);

    expect(axiosMock.history.get[0].url).toEqual(apiUrls.competencyCriteriaGroups(tagId));
    expect(result).toEqual(mockResponse);
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

    await expect(getDefaultCompetencyRuleProfile()).rejects.toThrow();
  });

  it('creates a new criterion, sending a snake_case payload and camelCasing the response', async () => {
    const { axiosMock } = initializeMocks();
    const payload = { object_id: 'block-a', group_id: 10 };
    axiosMock.onPost(apiUrls.createCompetencyCriterion(tagId)).reply(201, {
      id: 999,
      object_id: 'block-a',
      competency_criteria_group_id: 10,
      rule_profile_id: 1,
      rule_type_override: null,
      rule_payload_override: null,
    });

    const result = await createCompetencyCriterion(tagId, payload);

    expect(axiosMock.history.post[0].url).toEqual(apiUrls.createCompetencyCriterion(tagId));
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual(payload);
    expect(result).toEqual({
      id: 999,
      objectId: 'block-a',
      competencyCriteriaGroupId: 10,
      ruleProfileId: 1,
      ruleTypeOverride: null,
      rulePayloadOverride: null,
    });
  });
});
