import { useState } from 'react';
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
import type { MockCompetencyAssociationsOverrides } from '../__mocks__';
import type { CompetencyCriteriaGroupsResponse, GradeRulePayload } from '../data/types';
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

  describe('placeholder whose default score another box already uses', () => {
    const renderTakenPlaceholder = (setPlaceholderRulePayload = jest.fn()) =>
      render(
        <MockCompetencyAssociationsProvider
          value={{ focus: { groupId: 10, ruleKey: null }, setPlaceholderRulePayload }}
        >
          <RuleBoxList groupId={10} boxes={boxes} subsectionNamesByUsageKey={{}} canEdit />
        </MockCompetencyAssociationsProvider>,
      );

    it('explains the clash and offers the nearest unused score', async () => {
      const user = userEvent.setup();
      const setPlaceholderRulePayload = jest.fn();
      renderTakenPlaceholder(setPlaceholderRulePayload);

      expect(screen.getByText(/Another rule in this group already uses 70% or higher/)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Use 75% or higher' }));

      expect(setPlaceholderRulePayload).toHaveBeenCalledWith({ op: 'gte', value: 0.75, scale: 'percent' });
    });

    it('does not focus the score input again once the author has set a score', () => {
      render(
        <MockCompetencyAssociationsProvider
          value={{
            focus: { groupId: 10, ruleKey: null },
            placeholder: {
              parentRuleGroupId: null,
              logicOperator: 'OR',
              rulePayload: { op: 'gte', value: 0.7, scale: 'percent' },
            },
          }}
        >
          <RuleBoxList groupId={10} boxes={boxes} subsectionNamesByUsageKey={{}} canEdit />
        </MockCompetencyAssociationsProvider>,
      );

      const inputs = screen.getAllByLabelText('Score threshold percentage');
      expect(inputs[inputs.length - 1]).not.toHaveFocus();
    });

    it('focuses the input after the suggestion is applied, and not after the next typed score', async () => {
      const user = userEvent.setup();
      const StatefulProvider = () => {
        const [rulePayload, setRulePayload] = useState<GradeRulePayload | null>(null);
        return (
          <MockCompetencyAssociationsProvider
            value={{
              focus: { groupId: 10, ruleKey: null },
              placeholder: { parentRuleGroupId: null, logicOperator: 'OR', rulePayload },
              placeholderDuplicateRejected: false,
              setPlaceholderRulePayload: setRulePayload,
            }}
          >
            <RuleBoxList groupId={10} boxes={boxes} subsectionNamesByUsageKey={{}} canEdit />
          </MockCompetencyAssociationsProvider>
        );
      };
      render(<StatefulProvider />);
      const lastInput = () => {
        const inputs = screen.getAllByLabelText('Score threshold percentage');
        return inputs[inputs.length - 1];
      };

      await user.click(screen.getByRole('button', { name: 'Use 75% or higher' }));
      expect(lastInput()).toHaveValue('75');
      expect(lastInput()).toHaveFocus();

      await user.clear(lastInput());
      await user.type(lastInput(), '80');
      await user.keyboard('{Enter}');

      expect(lastInput()).toHaveValue('80');
      expect(lastInput()).not.toHaveFocus();
    });

    it('focuses the placeholder\'s score input when it appears', () => {
      renderTakenPlaceholder();

      const inputs = screen.getAllByLabelText('Score threshold percentage');
      expect(inputs[inputs.length - 1]).toHaveFocus();
    });
  });

  describe('rejected duplicate placeholder', () => {
    const renderRejected = (count: number, boxesInGroup = boxes) => {
      const ui = (rejectionCount: number) => (
        <MockCompetencyAssociationsProvider
          value={{
            focus: { groupId: 10, ruleKey: null },
            placeholderDuplicateRejected: true,
            placeholderRejectionCount: rejectionCount,
          }}
        >
          <RuleBoxList groupId={10} boxes={boxesInGroup} subsectionNamesByUsageKey={{}} canEdit />
        </MockCompetencyAssociationsProvider>
      );
      return { ...render(ui(count)), ui };
    };

    const scoreInputs = () => screen.getAllByLabelText('Score threshold percentage');

    it('focuses the suggestion link and marks the score input invalid', () => {
      renderRejected(1);

      expect(screen.getByRole('button', { name: 'Use 75% or higher' })).toHaveFocus();
      expect(scoreInputs()[scoreInputs().length - 1]).toHaveAttribute('aria-invalid', 'true');
    });

    it('moves focus back to the link on each further rejection', () => {
      const { rerender, ui } = renderRejected(1);
      scoreInputs()[0].focus();
      expect(screen.getByRole('button', { name: 'Use 75% or higher' })).not.toHaveFocus();

      rerender(ui(2));

      expect(screen.getByRole('button', { name: 'Use 75% or higher' })).toHaveFocus();
    });

    it('shows the hint without a link and focuses the score input when no score is free', () => {
      const takenScores = [70, 75, 80, 85, 90, 95, 100];
      const fullBoxes = ruleBoxesForGroup(
        10,
        buildCompetencyCriteriaGroupsIndex({
          groups: [group(10, null, null, 0)],
          criteria: takenScores.map((percent, i) => (
            i === 0
              ? criterion(300 + i, `block-${i}`, 10)
              : criterion(300 + i, `block-${i}`, 10, {
                ruleProfileId: null,
                ruleTypeOverride: 'grade',
                rulePayloadOverride: { op: 'gte', value: percent / 100, scale: 'percent' },
              })
          )),
        }),
        systemDefaultProfile,
      );

      renderRejected(1, fullBoxes);

      expect(screen.getByText(/already uses/)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Use / })).not.toBeInTheDocument();
      expect(scoreInputs()[scoreInputs().length - 1]).toHaveFocus();
    });
  });

  describe('placeholder rule box', () => {
    // One real box (gte 75%), distinct from the placeholder's default display of gte 70%.
    const placeholderBoxes = ruleBoxesForGroup(
      10,
      buildCompetencyCriteriaGroupsIndex({
        groups: [group(10, null, null, 0)],
        criteria: [
          criterion(201, 'block-x', 10, {
            ruleProfileId: null,
            ruleTypeOverride: 'grade',
            rulePayloadOverride: { op: 'gte', value: 0.75, scale: 'percent' },
          }),
        ],
      }),
      systemDefaultProfile,
    );

    const renderWithPlaceholder = (
      contextOverrides: MockCompetencyAssociationsOverrides = {},
      canEdit = true,
    ) =>
      render(
        <MockCompetencyAssociationsProvider value={{ focus: { groupId: 10, ruleKey: null }, ...contextOverrides }}>
          <RuleBoxList
            groupId={10}
            boxes={placeholderBoxes}
            subsectionNamesByUsageKey={{}}
            canEdit={canEdit}
          />
        </MockCompetencyAssociationsProvider>,
      );

    it('renders last, showing the system default rule while the author has not set a score', () => {
      const { container } = renderWithPlaceholder({}, false);

      const boxes = container.querySelectorAll('.rule-box');
      expect(boxes).toHaveLength(2);
      expect(boxes[1]).toHaveTextContent('With a score of 70% or higher');
      expect(boxes[1]).toHaveTextContent('Select content below to add it here.');
    });

    it('is absent when another rule box in the group is focused', () => {
      const { container } = renderWithPlaceholder({ focus: { groupId: 10, ruleKey: placeholderBoxes[0].key } });

      expect(container.querySelectorAll('.rule-box')).toHaveLength(1);
    });

    it('writes a score change to setPlaceholderRulePayload, not updateRuleScore', async () => {
      const user = userEvent.setup();
      const setPlaceholderRulePayload = jest.fn();
      const updateRuleScore = jest.fn();
      renderWithPlaceholder({ setPlaceholderRulePayload, updateRuleScore });

      const inputs = screen.getAllByLabelText('Score threshold percentage');
      const placeholderInput = inputs[inputs.length - 1];
      await user.clear(placeholderInput);
      await user.type(placeholderInput, '80');
      await user.keyboard('{Enter}');

      expect(setPlaceholderRulePayload).toHaveBeenCalledWith({ op: 'gte', value: 0.8, scale: 'percent' });
      expect(updateRuleScore).not.toHaveBeenCalled();
    });

    it('refuses a score that duplicates the real box\'s rule', async () => {
      const user = userEvent.setup();
      const setPlaceholderRulePayload = jest.fn();
      renderWithPlaceholder({ setPlaceholderRulePayload });

      const inputs = screen.getAllByLabelText('Score threshold percentage');
      const placeholderInput = inputs[inputs.length - 1];
      await user.clear(placeholderInput);
      await user.type(placeholderInput, '75');
      await user.keyboard('{Enter}');

      expect(screen.getByText('Another rule box in this group already uses this score.')).toBeInTheDocument();
      expect(setPlaceholderRulePayload).not.toHaveBeenCalled();
    });
  });
});
