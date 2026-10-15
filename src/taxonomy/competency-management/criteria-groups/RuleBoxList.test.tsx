import {
  initializeMocks,
  render,
  screen,
  userEvent,
} from '@src/testUtils';
import { MockCompetencyAssociationsProvider } from '../testHelpers';
import type { CompetencyCriteriaGroupsResponse, CompetencyRuleProfile } from '../data/types';
import { buildCompetencyCriteriaGroupsIndex } from '../utils';
import RuleBoxList from './RuleBoxList';

const systemDefaultProfile: CompetencyRuleProfile = {
  id: 1,
  scopeType: 'system_default',
  ruleType: 'grade',
  rulePayload: { op: 'gte', value: 0.7, scale: 'percent' },
  archived: false,
};

// Group 10 holds two criteria sharing the default profile's rule (101, 102)
// and one with a different override (103).
const response: CompetencyCriteriaGroupsResponse = {
  groups: [
    {
      id: 10,
      parentId: null,
      tagId: 42,
      courseKey: null,
      name: 'leaf',
      ordering: 0,
      logicOperator: 'AND',
      archived: false,
    },
  ],
  criteria: [
    {
      id: 101,
      objectId: 'block-a',
      groupId: 10,
      ruleProfileId: 1,
      ruleTypeOverride: null,
      rulePayloadOverride: null,
    },
    {
      id: 102,
      objectId: 'block-b',
      groupId: 10,
      ruleProfileId: 1,
      ruleTypeOverride: null,
      rulePayloadOverride: null,
    },
    {
      id: 103,
      objectId: 'block-c',
      groupId: 10,
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
    const { container } = render(
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

    const boxes = container.querySelectorAll('.rule-box');
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
    const { container } = render(
      <MockCompetencyAssociationsProvider value={{ focus: { groupId: 10, ruleKey: 'grade:lte:0.9:percent' } }}>
        <RuleBoxList
          groupId={10}
          index={index}
          systemDefaultProfile={systemDefaultProfile}
          subsectionNamesByUsageKey={{}}
        />
      </MockCompetencyAssociationsProvider>,
    );

    const boxes = container.querySelectorAll('.rule-box');
    expect(boxes[0].className).not.toContain('rule-box--focused');
    expect(boxes[1].className).toContain('rule-box--focused');
  });

  it('renders no box as focused, without throwing, when the focused key matches none rendered', () => {
    const index = buildCompetencyCriteriaGroupsIndex(response);
    let container!: HTMLElement;
    expect(() => {
      ({ container } = render(
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
      ));
    }).not.toThrow();

    container.querySelectorAll('.rule-box').forEach((box) => {
      expect(box.className).not.toContain('rule-box--focused');
    });
  });

  describe('duplicate-score validation (real getInlineValidationMessage, not mocked)', () => {
    const duplicateCheckResponse: CompetencyCriteriaGroupsResponse = {
      groups: [
        {
          id: 10,
          parentId: null,
          tagId: 42,
          courseKey: null,
          name: 'leaf',
          ordering: 0,
          logicOperator: 'AND',
          archived: false,
        },
      ],
      criteria: [
        {
          id: 201,
          objectId: 'block-x',
          groupId: 10,
          ruleProfileId: null,
          ruleTypeOverride: 'grade',
          rulePayloadOverride: { op: 'gte', value: 0.6, scale: 'percent' },
        },
        {
          id: 202,
          objectId: 'block-y',
          groupId: 10,
          ruleProfileId: null,
          ruleTypeOverride: 'grade',
          rulePayloadOverride: { op: 'gte', value: 0.8, scale: 'percent' },
        },
      ],
    };

    const renderEditableBoxes = (updateRuleScore: jest.Mock) => {
      const index = buildCompetencyCriteriaGroupsIndex(duplicateCheckResponse);
      return render(
        <MockCompetencyAssociationsProvider value={{ updateRuleScore }}>
          <RuleBoxList
            groupId={10}
            index={index}
            systemDefaultProfile={systemDefaultProfile}
            subsectionNamesByUsageKey={{}}
            canEdit
          />
        </MockCompetencyAssociationsProvider>,
      );
    };

    it('refuses to save a score that would duplicate another box\'s own rule in the same group', async () => {
      const user = userEvent.setup();
      const updateRuleScore = jest.fn().mockResolvedValue(undefined);
      renderEditableBoxes(updateRuleScore);

      const [firstBoxInput] = screen.getAllByRole('textbox');
      await user.clear(firstBoxInput);
      await user.type(firstBoxInput, '80');
      await user.keyboard('{Enter}');

      expect(updateRuleScore).not.toHaveBeenCalled();
      expect(screen.getByText('Another rule box in this group already uses this score.')).toBeInTheDocument();
    });

    it('does not treat retyping a box\'s own current score as a duplicate of itself', async () => {
      const user = userEvent.setup();
      const updateRuleScore = jest.fn().mockResolvedValue(undefined);
      renderEditableBoxes(updateRuleScore);

      const [firstBoxInput] = screen.getAllByRole('textbox');
      await user.clear(firstBoxInput);
      await user.type(firstBoxInput, '60');
      await user.keyboard('{Enter}');

      expect(updateRuleScore).not.toHaveBeenCalled();
      expect(screen.queryByText('Another rule box in this group already uses this score.')).not.toBeInTheDocument();
    });
  });
});
