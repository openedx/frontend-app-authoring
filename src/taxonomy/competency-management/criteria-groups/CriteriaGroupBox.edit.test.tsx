import {
  initializeMocks,
  render,
  screen,
  userEvent,
} from '@src/testUtils';
import { buildMockCompetencyAssociationsContextValue, MockCompetencyAssociationsProvider } from '../testHelpers';
import type {
  BottomTierCompetencyCriteriaGroup,
  CompetencyCriteriaGroupsResponse,
  CompetencyRuleProfile,
  CourseCompetencyCriteriaGroup,
} from '../data/types';
import { buildCompetencyCriteriaGroupsIndex } from '../utils';
import CriteriaGroupBox from './CriteriaGroupBox';

const systemDefaultProfile: CompetencyRuleProfile = {
  id: 1,
  scopeType: 'system_default',
  ruleType: 'grade',
  rulePayload: { op: 'gte', value: 0.7, scale: 'percent' },
  archived: false,
};

const courseGroup: CourseCompetencyCriteriaGroup = {
  id: 1,
  parentId: null,
  depth: 1,
  ordering: 0,
  logicOperator: 'and',
  courseKey: 'course-v1:OrgX+CS101+2024',
};

const group: BottomTierCompetencyCriteriaGroup = {
  id: 10,
  parentId: 1,
  depth: 2,
  ordering: 0,
  logicOperator: 'and',
};

const response: CompetencyCriteriaGroupsResponse = {
  groups: [courseGroup, group],
  criteria: [
    {
      id: 101,
      objectId: 'block-a',
      competencyCriteriaGroupId: 10,
      ruleProfileId: 1,
      ruleTypeOverride: null,
      rulePayloadOverride: null,
    },
  ],
};

const index = buildCompetencyCriteriaGroupsIndex(response);

const renderBox = (
  contextOverrides: Parameters<typeof buildMockCompetencyAssociationsContextValue>[0] = {},
  canEdit: boolean = true,
  boxGroup: BottomTierCompetencyCriteriaGroup = group,
) => (
  render(
    <MockCompetencyAssociationsProvider value={{ index, systemDefaultProfile, ...contextOverrides }}>
      <CriteriaGroupBox group={boxGroup} subsectionNamesByUsageKey={{}} canEdit={canEdit} />
    </MockCompetencyAssociationsProvider>,
  )
);

describe('<CriteriaGroupBox /> editing (#794)', () => {
  beforeEach(() => {
    initializeMocks();
    Element.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the any/all label as plain text with no control when canEdit is false', () => {
    const { container } = renderBox({}, false);

    expect(screen.getByText('all')).toBeInTheDocument();
    // Two `role="button"` elements exist (the group's own container and its
    // rule box) - neither is a `Dropdown` trigger, since `canEdit` is false.
    expect(screen.getAllByRole('button')).toHaveLength(2);
    expect(container.querySelector('.dropdown-toggle')).not.toBeInTheDocument();
  });

  it('calls updateGroupOperator with the group id and the selected operator when canEdit is true', async () => {
    const user = userEvent.setup();
    const updateGroupOperator = jest.fn();
    renderBox({ updateGroupOperator });

    await user.click(screen.getByRole('button', { name: 'all' }));
    await user.click(screen.getByText('any'));

    expect(updateGroupOperator).toHaveBeenCalledWith(10, 'or');
  });

  it(
    'keeps showing the prior label after a rejected save, since the control is controlled by the group '
      + 'prop, not by the click that was made',
    async () => {
      const user = userEvent.setup();
      const updateGroupOperator = jest.fn();
      const { container, rerender } = renderBox({ updateGroupOperator });

      await user.click(screen.getByRole('button', { name: 'all' }));
      await user.click(screen.getByText('any'));
      expect(updateGroupOperator).toHaveBeenCalledWith(10, 'or');

      // A rejected save never updates `group.logicOperator` - simulated by
      // re-rendering with the same, unchanged `group` (the real caller's
      // `groupsQuery` data is likewise unchanged after a rejected mutation).
      rerender(
        <MockCompetencyAssociationsProvider value={{ index, systemDefaultProfile, updateGroupOperator }}>
          <CriteriaGroupBox group={group} subsectionNamesByUsageKey={{}} canEdit />
        </MockCompetencyAssociationsProvider>,
      );

      expect(container.querySelector('.dropdown-toggle')).toHaveTextContent('all');
    },
  );
});
