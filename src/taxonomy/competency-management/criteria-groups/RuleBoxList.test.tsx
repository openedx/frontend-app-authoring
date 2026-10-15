import {
  initializeMocks,
  render,
  screen,
  userEvent,
  within,
} from '@src/testUtils';
import {
  criterion,
  group,
  mockScrollIntoView,
  MockCompetencyAssociationsProvider,
  systemDefaultProfile,
} from '../__mocks__';
import type { CompetencyCriteriaGroupsResponse } from '../data/types';
import { buildCompetencyCriteriaGroupsIndex, ruleBoxesForGroup } from '../utils';
import RuleBoxList from './RuleBoxList';

// Group 10 holds two criteria sharing the default profile's rule (101, 102)
// and one with a different override (103).
const response: CompetencyCriteriaGroupsResponse = {
  groups: [group(10, null, null, 0)],
  criteria: [
    criterion(101, 'block-a', 10),
    criterion(102, 'block-b', 10),
    criterion(103, 'block-c', 10, {
      ruleProfileId: null,
      ruleTypeOverride: 'grade',
      rulePayloadOverride: { op: 'lte', value: 0.9, scale: 'percent' },
    }),
  ],
};

const boxes = ruleBoxesForGroup(10, buildCompetencyCriteriaGroupsIndex(response), systemDefaultProfile);

const renderList = (
  focus: { groupId: number; ruleKey: string; } | null = null,
  listedBoxes = boxes,
) => (
  render(
    <MockCompetencyAssociationsProvider value={{ focus }}>
      <RuleBoxList
        groupId={10}
        boxes={listedBoxes}
        subsectionNamesByUsageKey={{ 'block-a': 'Subsection A', 'block-b': 'Subsection B', 'block-c': 'Subsection C' }}
      />
    </MockCompetencyAssociationsProvider>,
  )
);

describe('<RuleBoxList />', () => {
  mockScrollIntoView();
  beforeEach(() => {
    initializeMocks();
  });

  it('renders two criteria sharing a rule as one box, and an override rule as a second box with its own threshold', () => {
    renderList();

    const controls = screen.getAllByRole('button');
    expect(controls.map((control) => control.textContent)).toEqual([
      'With a score of 70% or higher',
      'With a score of 90% or lower',
    ]);
    const [defaultBox, overrideBox] = controls.map((control) => within(control.parentElement!));
    expect(defaultBox.getAllByText(/^Subsection/).map((chip) => chip.textContent)).toEqual([
      'Subsection A',
      'Subsection B',
    ]);
    expect(overrideBox.getAllByText(/^Subsection/).map((chip) => chip.textContent)).toEqual(['Subsection C']);
  });

  it('renders a criterion following the default and one overriding it with the same rule as one box', () => {
    const sameRuleIndex = buildCompetencyCriteriaGroupsIndex({
      groups: [group(10, null, null, 0)],
      criteria: [
        criterion(101, 'block-a', 10),
        criterion(102, 'block-b', 10, {
          ruleProfileId: null,
          ruleTypeOverride: systemDefaultProfile.ruleType,
          rulePayloadOverride: systemDefaultProfile.rulePayload,
        }),
      ],
    });
    renderList(null, ruleBoxesForGroup(10, sameRuleIndex, systemDefaultProfile));

    const controls = screen.getAllByRole('button');
    expect(controls).toHaveLength(1);
    expect(controls[0]).toHaveTextContent('With a score of 70% or higher');
    expect(
      within(controls[0].parentElement!).getAllByText(/^Subsection/).map((chip) => chip.textContent),
    ).toEqual(['Subsection A', 'Subsection B']);
  });

  it('marks only the box matching the context focus as current', () => {
    renderList({ groupId: 10, ruleKey: 'grade:lte:0.9:percent' });

    const [defaultBox, overrideBox] = screen.getAllByRole('button');
    expect(defaultBox).toHaveAttribute('aria-current', 'false');
    expect(overrideBox).toHaveAttribute('aria-current', 'true');
  });

  it('marks no box as current when the focused key matches none rendered', () => {
    renderList({ groupId: 10, ruleKey: 'stale-key-that-matches-nothing' });

    screen.getAllByRole('button').forEach((control) => {
      expect(control).toHaveAttribute('aria-current', 'false');
    });
  });

  describe('duplicate-score validation', () => {
    // Boxes: gte 60 (criteria 201) and gte 80 (criteria 202).
    const duplicateCheckResponse: CompetencyCriteriaGroupsResponse = {
      groups: [group(10, null, null, 0)],
      criteria: [
        criterion(201, 'block-x', 10, {
          ruleProfileId: null,
          ruleTypeOverride: 'grade',
          rulePayloadOverride: { op: 'gte', value: 0.6, scale: 'percent' },
        }),
        criterion(202, 'block-y', 10, {
          ruleProfileId: null,
          ruleTypeOverride: 'grade',
          rulePayloadOverride: { op: 'gte', value: 0.8, scale: 'percent' },
        }),
      ],
    };
    const editableBoxes = ruleBoxesForGroup(
      10,
      buildCompetencyCriteriaGroupsIndex(duplicateCheckResponse),
      systemDefaultProfile,
    );

    const renderEditableList = (updateRuleScore: jest.Mock) =>
      render(
        <MockCompetencyAssociationsProvider value={{ updateRuleScore }}>
          <RuleBoxList groupId={10} boxes={editableBoxes} subsectionNamesByUsageKey={{}} canEdit />
        </MockCompetencyAssociationsProvider>,
      );

    const typeInFirstBox = async (score: string) => {
      const user = userEvent.setup();
      const [firstBoxInput] = screen.getAllByRole('textbox');
      await user.clear(firstBoxInput);
      await user.type(firstBoxInput, score);
      await user.keyboard('{Enter}');
    };

    it('refuses to save a score that duplicates another box\'s rule in the same group', async () => {
      const updateRuleScore = jest.fn().mockResolvedValue(undefined);
      renderEditableList(updateRuleScore);

      await typeInFirstBox('80');

      expect(updateRuleScore).not.toHaveBeenCalled();
      expect(screen.getByText('Another rule box in this group already uses this score.')).toBeInTheDocument();
    });

    it('does not treat retyping a box\'s own score as a duplicate of itself', async () => {
      const updateRuleScore = jest.fn().mockResolvedValue(undefined);
      renderEditableList(updateRuleScore);

      await typeInFirstBox('60');

      expect(updateRuleScore).not.toHaveBeenCalled();
      expect(screen.queryByText('Another rule box in this group already uses this score.')).not.toBeInTheDocument();
    });
  });
});
