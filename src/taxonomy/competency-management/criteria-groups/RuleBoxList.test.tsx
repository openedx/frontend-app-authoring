import { initializeMocks, render, screen, within } from '@src/testUtils';
import {
  criterion,
  group,
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

const renderList = (focus: { groupId: number; ruleKey: string; } | null = null) => (
  render(
    <MockCompetencyAssociationsProvider value={{ focus }}>
      <RuleBoxList
        groupId={10}
        boxes={boxes}
        subsectionNamesByUsageKey={{ 'block-a': 'Subsection A', 'block-b': 'Subsection B', 'block-c': 'Subsection C' }}
      />
    </MockCompetencyAssociationsProvider>,
  )
);

const originalScrollIntoView = Element.prototype.scrollIntoView;

describe('<RuleBoxList />', () => {
  beforeEach(() => {
    initializeMocks();
    Element.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView;
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
});
