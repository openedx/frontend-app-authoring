import { buildOutlineIndex } from '@src/course-outline/__mocks__';
import { getCourseOutlineIndexApiUrl } from '@src/course-outline/data';
import {
  fireEvent,
  initializeMocks,
  render,
  screen,
} from '@src/testUtils';
import { buildMockCompetencyAssociationsContextValue, MockCompetencyAssociationsProvider } from '../testHelpers';
import type {
  CompetencyCriteriaGroupsResponse,
  CompetencyRuleProfile,
  CourseCompetencyCriteriaGroup,
} from '../data/types';
import { buildCompetencyCriteriaGroupsIndex } from '../utils';
import CourseGroupSection from './CourseGroupSection';

let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];

const courseKey = 'course-v1:OrgX+CS101+2024';
const outlineApiUrl = getCourseOutlineIndexApiUrl(courseKey);

const courseGroup: CourseCompetencyCriteriaGroup = {
  id: 1,
  parentId: null,
  depth: 1,
  ordering: 0,
  logicOperator: 'or',
  courseKey,
};

// Two bottom-tier groups (10, 11) under the same course, each with one
// criterion pointing at a real subsection in the outline fixture below.
const response: CompetencyCriteriaGroupsResponse = {
  groups: [
    courseGroup,
    { id: 10, parentId: 1, depth: 2, ordering: 0, logicOperator: 'and' },
    { id: 11, parentId: 1, depth: 2, ordering: 1, logicOperator: 'and' },
  ],
  criteria: [
    {
      id: 101,
      objectId: 'sub-1a',
      competencyCriteriaGroupId: 10,
      ruleProfileId: 1,
      ruleTypeOverride: null,
      rulePayloadOverride: null,
    },
    {
      id: 102,
      objectId: 'sub-2a',
      competencyCriteriaGroupId: 11,
      ruleProfileId: 1,
      ruleTypeOverride: null,
      rulePayloadOverride: null,
    },
  ],
};

const systemDefaultProfile: CompetencyRuleProfile = {
  id: 1,
  scopeType: 'system_default',
  ruleType: 'grade',
  rulePayload: { op: 'gte', value: 0.7, scale: 'percent' },
  archived: false,
};

const index = buildCompetencyCriteriaGroupsIndex(response);

// `usageKey: undefined` on each subsection node mirrors the real
// `course_index` response, captured directly against a live devstack: a
// block object there only ever carries `id`, never `usage_key` - so a
// fixture that (like `buildOutlineIndex`'s own default) sets both `id` and
// `usageKey` to the same value can't tell correct `.id`-based code apart
// from the original `.usageKey`-based bug, since both would resolve to the
// same string. Overriding `usageKey` away here means "resolves its header
// and chip names" below only passes if `CourseGroupSection` actually reads
// `.id`, the same field this feature's other real-outline consumer
// (`CourseOutlineSubtree`) was fixed to read too.
const outlineFixture = buildOutlineIndex({
  sections: [
    {
      id: 'section-1',
      displayName: 'Section 1',
      children: [{ id: 'sub-1a', displayName: 'Subsection 1A', overrides: { usageKey: undefined } }],
    },
    {
      id: 'section-2',
      displayName: 'Section 2',
      children: [{ id: 'sub-2a', displayName: 'Subsection 2A', overrides: { usageKey: undefined } }],
    },
  ],
  overrides: { courseStructure: { displayName: 'Demo Course' } },
});

const renderSection = (
  contextOverrides: Parameters<typeof buildMockCompetencyAssociationsContextValue>[0] = {},
) => (
  render(
    <MockCompetencyAssociationsProvider value={{ index, systemDefaultProfile, ...contextOverrides }}>
      <CourseGroupSection courseGroup={courseGroup} />
    </MockCompetencyAssociationsProvider>,
  )
);

describe('<CourseGroupSection />', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    Element.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('resolves its header and chip names from its own outline fetch', async () => {
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    renderSection();

    expect(await screen.findByText('Demo Course')).toBeInTheDocument();
    expect(screen.getByText('Subsection 1A')).toBeInTheDocument();
    expect(screen.getByText('Subsection 2A')).toBeInTheDocument();
  });

  it(
    'does not throw if its own outline fetch fails (defensive only - CourseGroupList never actually '
      + 'mounts this component for a course whose outline fetch failed, per CompetencyAssociationsContext\'s '
      + 'own accessibleCourseGroups filtering)',
    async () => {
      axiosMock.onGet(outlineApiUrl).reply(403);
      expect(() => renderSection()).not.toThrow();
      // The fallback still renders *something* rather than blanking the
      // section entirely - a defensive last resort, never exercised by a
      // real, accessible course in production.
      expect(await screen.findByText(courseKey)).toBeInTheDocument();
    },
  );

  it('renders exactly one connector for its two bottom-tier groups (N children -> N-1 connectors)', async () => {
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    renderSection();

    await screen.findByText('Demo Course');
    expect(screen.getAllByTestId('group-connector')).toHaveLength(1);
  });

  it('collapses and re-expands independently via its own chevron', async () => {
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    renderSection();

    await screen.findByText('Demo Course');
    expect(screen.getByText('Subsection 1A')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Collapse' }));
    expect(screen.queryByText('Subsection 1A')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expand' }));
    expect(screen.getByText('Subsection 1A')).toBeInTheDocument();
  });

  it('renders nothing as focused, without throwing, when a collapsed section holds the focused group/rule box', async () => {
    axiosMock.onGet(outlineApiUrl).reply(200, outlineFixture);
    renderSection({ focus: { groupId: 10, ruleKey: 'grade:gte:0.7:percent' } });

    await screen.findByText('Demo Course');
    fireEvent.click(screen.getByRole('button', { name: 'Collapse' }));

    expect(screen.queryByText('Subsection 1A')).not.toBeInTheDocument();
    expect(screen.queryByText(/By completing/)).not.toBeInTheDocument();
  });
});
