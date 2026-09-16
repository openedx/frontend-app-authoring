import { initializeMocks, render, screen } from '@src/testUtils';
import { MockCompetencyAssociationsProvider } from '../testHelpers';
import type { CompetencyCriteriaGroupsResponse, CompetencyRuleProfile } from '../data/types';
import { buildCompetencyCriteriaGroupsIndex } from '../utils';
import RuleBoxList from './RuleBoxList';

const systemDefaultProfile: CompetencyRuleProfile = {
  id: 1,
  ruleType: 'grade',
  rulePayload: { op: 'gte', value: 0.7, scale: 'percent' },
};

// Group 10 holds two criteria sharing the default profile's rule (101, 102)
// and one with a different override (103).
const response: CompetencyCriteriaGroupsResponse = {
  groups: [
    { id: 10, parentId: null, depth: 2, ordering: 0, logicOperator: 'and' },
  ],
  criteria: [
    {
      id: 101,
      objectId: 'block-a',
      competencyCriteriaGroupId: 10,
      ruleProfileId: 1,
      ruleTypeOverride: null,
      rulePayloadOverride: null,
    },
    {
      id: 102,
      objectId: 'block-b',
      competencyCriteriaGroupId: 10,
      ruleProfileId: 1,
      ruleTypeOverride: null,
      rulePayloadOverride: null,
    },
    {
      id: 103,
      objectId: 'block-c',
      competencyCriteriaGroupId: 10,
      ruleProfileId: null,
      ruleTypeOverride: 'grade',
      rulePayloadOverride: { op: 'lte', value: 0.9, scale: 'percent' },
    },
  ],
};

describe('<RuleBoxList />', () => {
  beforeEach(() => {
    initializeMocks();
    Element.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders two criteria sharing a rule as one box, and a different rule as a second box', () => {
    const index = buildCompetencyCriteriaGroupsIndex(response);
    render(
      <MockCompetencyAssociationsProvider>
        <RuleBoxList
          groupId={10}
          index={index}
          systemDefaultProfile={systemDefaultProfile}
          subsectionNamesByUsageKey={{
            'block-a': 'Subsection A',
            'block-b': 'Subsection B',
            'block-c': 'Subsection C',
          }}
        />
      </MockCompetencyAssociationsProvider>,
    );

    const boxes = screen.getAllByRole('button');
    expect(boxes).toHaveLength(2);
    // Box 1 (min criterion id 101) holds both Subsection A and B.
    expect(boxes[0]).toHaveTextContent('Subsection A');
    expect(boxes[0]).toHaveTextContent('Subsection B');
    expect(boxes[0]).toHaveTextContent('With a score of 70% or higher');
    // Box 2 (min criterion id 103) holds only Subsection C, with its own rule.
    expect(boxes[1]).toHaveTextContent('Subsection C');
    expect(boxes[1]).toHaveTextContent('With a score of 90% or lower');
  });

  it('marks only the box matching the context focus as focused', () => {
    const index = buildCompetencyCriteriaGroupsIndex(response);
    render(
      <MockCompetencyAssociationsProvider value={{ focus: { groupId: 10, ruleKey: 'grade:lte:0.9:percent' } }}>
        <RuleBoxList
          groupId={10}
          index={index}
          systemDefaultProfile={systemDefaultProfile}
          subsectionNamesByUsageKey={{}}
        />
      </MockCompetencyAssociationsProvider>,
    );

    const boxes = screen.getAllByRole('button');
    expect(boxes[0].className).not.toContain('rule-box--focused');
    expect(boxes[1].className).toContain('rule-box--focused');
  });

  it('renders no box as focused, without throwing, when the focused key matches none rendered', () => {
    const index = buildCompetencyCriteriaGroupsIndex(response);
    expect(() =>
      render(
        <MockCompetencyAssociationsProvider
          value={{ focus: { groupId: 10, ruleKey: 'stale-key-that-matches-nothing' } }}
        >
          <RuleBoxList
            groupId={10}
            index={index}
            systemDefaultProfile={systemDefaultProfile}
            subsectionNamesByUsageKey={{}}
          />
        </MockCompetencyAssociationsProvider>,
      )
    ).not.toThrow();

    screen.getAllByRole('button').forEach((box) => {
      expect(box.className).not.toContain('rule-box--focused');
    });
  });
});
