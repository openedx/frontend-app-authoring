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
  tagId: 42,
  courseKey: 'course-v1:OrgX+CS101+2024',
  name: 'course',
  ordering: 0,
  logicOperator: 'AND',
  archived: false,
};

const group: BottomTierCompetencyCriteriaGroup = {
  id: 10,
  parentId: 1,
  tagId: 42,
  courseKey: null,
  name: 'leaf',
  ordering: 0,
  logicOperator: 'AND',
  archived: false,
};

const response: CompetencyCriteriaGroupsResponse = {
  groups: [courseGroup, group],
  criteria: [
    {
      id: 101,
      objectId: 'block-a',
      groupId: 10,
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

  it('renders the any/all label as plain text with no dropdown when canEdit is false', () => {
    const { container } = renderBox({}, false);

    expect(screen.getByText('all')).toBeInTheDocument();
    // The group's and the rule box's select buttons exist regardless of
    // `canEdit`; there's no `Dropdown` trigger since `canEdit` is false here.
    expect(screen.queryAllByRole('button')).toHaveLength(2);
    expect(container.querySelector('.dropdown-toggle')).not.toBeInTheDocument();
  });

  it('calls updateGroupOperator with the group id and the selected operator when canEdit is true', async () => {
    const user = userEvent.setup();
    const updateGroupOperator = jest.fn();
    renderBox({ updateGroupOperator });

    await user.click(screen.getByRole('button', { name: 'all' }));
    await user.click(screen.getByText('any'));

    expect(updateGroupOperator).toHaveBeenCalledWith(10, 'OR');
  });
});
