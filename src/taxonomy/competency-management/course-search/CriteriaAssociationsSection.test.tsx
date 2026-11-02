import { buildOutlineIndex } from '@src/course-outline/__mocks__';
import { getCourseOutlineIndexApiUrl } from '@src/course-outline/data';
import {
  act,
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
  within,
} from '@src/testUtils';
import {
  buildCourseListResponse,
  byTextContent,
  courseListUrl,
  defaultProfileResponse,
  mockHeldGroupsRefetch,
  mockScrollIntoView,
} from '../__mocks__';
import { CompetencyAssociationsProvider, useCompetencyAssociations } from '../CompetencyAssociationsContext';
import type { CompetencyTreeNode } from '../CompetencyTree';
import { apiUrls } from '../data/api';
import type { CompetencyCriteriaGroupsResponse, CompetencyCriterion } from '../data/types';
import CriteriaAssociationsSection from './CriteriaAssociationsSection';

let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];

const tagId = 42;
const competency: CompetencyTreeNode = { id: String(tagId), value: 'Data Literacy', externalId: null };

/** Shows when the profile query has landed, so a test can tell the course list or groups query alone is holding the list back. */
const ProfileLoadedProbe = () => {
  const { systemDefaultProfile } = useCompetencyAssociations();
  return systemDefaultProfile ? <span>profile loaded</span> : null;
};

const renderSection = () => (
  render(
    <CompetencyAssociationsProvider tagId={tagId} competencyName={competency.value} competencyExternalId="CCRS-1.3">
      <ProfileLoadedProbe />
      <CriteriaAssociationsSection competency={competency} />
    </CompetencyAssociationsProvider>,
  )
);

const noGroupsResponse = { groups: [], criteria: [], criteria_count: 0, total_criteria_count: 0 };

describe('<CriteriaAssociationsSection />', () => {
  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
    axiosMock.onGet(courseListUrl()).reply(200, buildCourseListResponse([]));
  });

  it('renders the associations header and the "Demonstrate Mastery For" line for the given competency', () => {
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(() => new Promise(() => {}));
    axiosMock.onGet(apiUrls.defaultCompetencyRuleProfile()).reply(() => new Promise(() => {}));
    renderSection();

    expect(screen.getByText('Competency Criteria Associations')).toBeInTheDocument();
    const masteryLine = screen.getByText(
      (_, element) =>
        element?.classList.contains('course-search-browse__associations-mastery') === true
        && element.textContent === 'Demonstrate Mastery For Data Literacy',
    );
    expect(within(masteryLine).getByText('Data Literacy')).toBeInTheDocument();
  });

  it('renders the empty-associations state once both queries resolve with no groups', async () => {
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(200, noGroupsResponse);
    axiosMock.onGet(apiUrls.defaultCompetencyRuleProfile()).reply(200, defaultProfileResponse);
    renderSection();

    expect(await screen.findByText(byTextContent('No content associated with Data Literacy yet.'))).toBeInTheDocument();
  });

  it('keeps loading, sends no groups request, and shows no empty state until the course list has loaded', async () => {
    axiosMock.onGet(courseListUrl()).reply(() => new Promise(() => {}));
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(200, noGroupsResponse);
    axiosMock.onGet(apiUrls.defaultCompetencyRuleProfile()).reply(200, defaultProfileResponse);
    renderSection();

    // Only the unlisted courses hold the list back once the profile has landed.
    expect(await screen.findByText('profile loaded')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText(byTextContent('No content associated with Data Literacy yet.'))).not.toBeInTheDocument();
    expect(axiosMock.history.get.filter((req) => req.url === apiUrls.competencyCriteriaGroups(tagId))).toHaveLength(0);
  });

  it('shows only the header lines, and no spinner, once the course list has failed', async () => {
    axiosMock.onGet(courseListUrl()).reply(500);
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(200, noGroupsResponse);
    axiosMock.onGet(apiUrls.defaultCompetencyRuleProfile()).reply(200, defaultProfileResponse);
    renderSection();

    expect(await screen.findByText('profile loaded')).toBeInTheDocument();
    await waitFor(() => {
      expect(axiosMock.history.get.some((req) => req.url === courseListUrl())).toBe(true);
    });
    expect(screen.getByText('Data Literacy', { selector: '.font-weight-bold' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText(byTextContent('No content associated with Data Literacy yet.'))).not.toBeInTheDocument();
    expect(axiosMock.history.get.filter((req) => req.url === apiUrls.competencyCriteriaGroups(tagId))).toHaveLength(0);
  });

  it('renders a failed state when the groups request fails', async () => {
    axiosMock.onGet(apiUrls.competencyCriteriaGroups(tagId)).reply(500);
    axiosMock.onGet(apiUrls.defaultCompetencyRuleProfile()).reply(200, defaultProfileResponse);
    renderSection();

    expect(await screen.findByText('There was a problem loading this competency\'s associations. Please try again.'))
      .toBeInTheDocument();
  });

  describe('removing a rule box (#833)', () => {
    mockScrollIntoView();

    const courseKey = 'course-v1:OrgX+CS101+2024';
    const group = { tagId, name: 'x', ordering: 0, logicOperator: 'AND', archived: false } as const;
    const hierarchy = [
      { ...group, id: 500, parentId: null, courseKey: null, name: 'root' },
      { ...group, id: 1, parentId: 500, courseKey, name: 'course' },
      { ...group, id: 10, parentId: 1, courseKey: null, name: 'leaf' },
    ];
    const defaultRuleCriterion = {
      id: 901,
      objectId: 'sub-a',
      groupId: 10,
      ruleProfileId: 1,
      ruleTypeOverride: null,
      rulePayloadOverride: null,
    };
    const eightyPercentCriterion: CompetencyCriterion = {
      id: 903,
      objectId: 'sub-c',
      groupId: 10,
      ruleProfileId: null,
      ruleTypeOverride: 'grade',
      rulePayloadOverride: { op: 'gte', value: 0.8, scale: 'percent' },
    };
    const withBothBoxes: CompetencyCriteriaGroupsResponse = {
      groups: hierarchy,
      criteria: [defaultRuleCriterion, eightyPercentCriterion],
      criteriaCount: 2,
      totalCriteriaCount: 2,
    };
    const onlyDefaultBox: CompetencyCriteriaGroupsResponse = {
      groups: hierarchy,
      criteria: [defaultRuleCriterion],
      criteriaCount: 1,
      totalCriteriaCount: 1,
    };
    const nothingLeft: CompetencyCriteriaGroupsResponse = {
      groups: [],
      criteria: [],
      criteriaCount: 0,
      totalCriteriaCount: 0,
    };
    const groupsUrl = apiUrls.competencyCriteriaGroups(tagId);
    const eightyPercentToggleName = 'More actions for the rule with a score of 80% or higher';
    const defaultToggleName = 'More actions for the rule with a score of 70% or higher';

    /** `mockHeldGroupsRefetch`, plus the profile, outline and delete replies a run needs. */
    const mockRun = (
      initial: CompetencyCriteriaGroupsResponse,
      refetched: CompetencyCriteriaGroupsResponse,
      deleteStatus = 200,
    ) => {
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
      axiosMock.onGet(courseListUrl()).reply(200, buildCourseListResponse([courseKey]));
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseKey)).reply(
        200,
        buildOutlineIndex({ overrides: { courseStructure: { displayName: 'Demo Course' } } }),
      );
      [901, 903].forEach((id) => {
        axiosMock.onDelete(apiUrls.deleteCompetencyCriterion(tagId, id)).reply(deleteStatus, { id, archived: false });
      });
      return mockHeldGroupsRefetch(axiosMock, tagId, initial, refetched);
    };

    const waitForHeldRefetch = () =>
      waitFor(() =>
        expect(axiosMock.history.get.filter((req) => req.url === groupsUrl))
          .toHaveLength(2)
      );

    const releaseRefetch = (control: { release: () => void; }) =>
      act(async () => {
        control.release();
      });

    const removeEightyPercentRuleFromKeyboard = async (
      deleteStatus: number,
      refetched: CompetencyCriteriaGroupsResponse,
    ) => {
      const user = userEvent.setup();
      const run = mockRun(withBothBoxes, refetched, deleteStatus);
      renderSection();

      const toggle = await screen.findByRole('button', { name: eightyPercentToggleName });
      act(() => toggle.focus());
      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('button', { name: 'Remove rule' })).toHaveFocus();
      await user.keyboard('{Enter}');

      await waitForHeldRefetch();
      await releaseRefetch(run);
    };

    it('returns keyboard focus to the group\'s header once the rule is removed', async () => {
      await removeEightyPercentRuleFromKeyboard(200, onlyDefaultBox);

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'By completing all of the following' })).toHaveFocus()
      );
      expect(screen.queryByRole('button', { name: /score of 80%/ })).not.toBeInTheDocument();
    });

    it('returns keyboard focus to the group\'s header when the removal fails, and keeps the rule', async () => {
      await removeEightyPercentRuleFromKeyboard(500, withBothBoxes);

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'By completing all of the following' })).toHaveFocus()
      );
      expect(screen.getByRole('button', { name: eightyPercentToggleName })).toBeInTheDocument();
    });

    it('leaves the empty state, with no course or group card, when the last box on the page is removed', async () => {
      const user = userEvent.setup();
      const run = mockRun(onlyDefaultBox, nothingLeft);
      renderSection();
      expect(await screen.findByText('Demo Course')).toBeInTheDocument();

      await user.click(await screen.findByRole('button', { name: defaultToggleName }));
      await user.click(screen.getByRole('button', { name: 'Remove rule' }));
      await waitForHeldRefetch();
      await releaseRefetch(run);

      expect(await screen.findByText(byTextContent('No content associated with Data Literacy yet.')))
        .toBeInTheDocument();
      expect(screen.queryByText('Demo Course')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /By completing/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /More actions/ })).not.toBeInTheDocument();
    });

    it('disables every actions menu on the panel until the refetch lands', async () => {
      const user = userEvent.setup();
      const run = mockRun(withBothBoxes, onlyDefaultBox);
      renderSection();

      await user.click(await screen.findByRole('button', { name: eightyPercentToggleName }));
      await user.click(screen.getByRole('button', { name: 'Remove rule' }));
      await waitForHeldRefetch();

      const heldMenus = screen.getAllByRole('button', { name: /More actions/ });
      // The course menu, the group menu, and the 70% and 80% rule menus.
      expect(heldMenus).toHaveLength(4);
      heldMenus.forEach((menu) => expect(menu).toBeDisabled());

      await releaseRefetch(run);

      await waitFor(() => {
        const menus = screen.getAllByRole('button', { name: /More actions/ });
        // The course menu, the group menu, and the 70% rule menu; the 80% one went with its box.
        expect(menus).toHaveLength(3);
        menus.forEach((menu) => expect(menu).toBeEnabled());
      });
    });
  });
});
