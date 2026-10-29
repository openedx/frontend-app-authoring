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
let mockShowToast: ReturnType<typeof initializeMocks>['mockShowToast'];

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
  mockScrollIntoView();

  beforeEach(() => {
    ({ axiosMock, mockShowToast } = initializeMocks());
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
  const group10With70And80PercentRuleBoxesResponse: CompetencyCriteriaGroupsResponse = {
    groups: hierarchy,
    criteria: [defaultRuleCriterion, eightyPercentCriterion],
    criteriaCount: 2,
    totalCriteriaCount: 2,
  };
  const group10With70PercentRuleBoxResponse: CompetencyCriteriaGroupsResponse = {
    groups: hierarchy,
    criteria: [defaultRuleCriterion],
    criteriaCount: 1,
    totalCriteriaCount: 1,
  };
  const noGroupsOrCriteriaResponse: CompetencyCriteriaGroupsResponse = {
    groups: [],
    criteria: [],
    criteriaCount: 0,
    totalCriteriaCount: 0,
  };
  const groupsUrl = apiUrls.competencyCriteriaGroups(tagId);
  const eightyPercentRuleBoxMenuName = 'More actions for the rule with a score of 80% or higher in rule group 1 in '
    + 'Demo Course';
  const seventyPercentRuleBoxMenuName = 'More actions for the rule with a score of 70% or higher in rule group 1 in '
    + 'Demo Course';

  /** Serves the profile, the course list and the course outline; the criterion DELETEs are mocked by the caller. */
  const mockProfileAndOutline = (outline: ReturnType<typeof buildOutlineIndex>) => {
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
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseKey)).reply(200, outline);
  };

  /** `mockHeldGroupsRefetch`, plus the profile, outline and delete replies a run needs. */
  const mockServerRepliesForRuleBoxDelete = (
    initial: CompetencyCriteriaGroupsResponse,
    refetched: CompetencyCriteriaGroupsResponse,
    deleteStatus = 200,
    outline = buildOutlineIndex({ overrides: { courseStructure: { displayName: 'Demo Course' } } }),
  ) => {
    mockProfileAndOutline(outline);
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

  describe('removing a rule box', () => {
    const removeRuleDialogName = 'Remove this rule from Data Literacy?';

    /** The dialog that follows "Remove rule": nothing is sent until its Remove button is clicked. */
    const confirmRemovalInDialog = async (user: ReturnType<typeof userEvent.setup>) => {
      const dialog = await screen.findByRole('dialog', { name: removeRuleDialogName });
      expect(axiosMock.history.delete).toHaveLength(0);
      await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    };

    /** Removes the 80% rule box with the keyboard. The panel starts from `startingResponse`, the delete requests
     * answer `deleteStatus`, and the panel refetches `responseAfterRefetch`.
     */
    const removeEightyPercentRuleFromKeyboard = async ({
      startingResponse,
      deleteStatus,
      responseAfterRefetch,
    }: {
      startingResponse: CompetencyCriteriaGroupsResponse;
      deleteStatus: number;
      responseAfterRefetch: CompetencyCriteriaGroupsResponse;
    }) => {
      const user = userEvent.setup();
      const run = mockServerRepliesForRuleBoxDelete(startingResponse, responseAfterRefetch, deleteStatus);
      renderSection();

      const menuButton = await screen.findByRole('button', { name: eightyPercentRuleBoxMenuName });
      act(() => menuButton.focus());
      await user.keyboard('{Enter}');
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('button', { name: 'Remove rule' })).toHaveFocus();
      await user.keyboard('{Enter}');
      await confirmRemovalInDialog(user);

      await waitForHeldRefetch();
      await releaseRefetch(run);
    };

    it('returns keyboard focus to the group\'s header once the rule is removed', async () => {
      await removeEightyPercentRuleFromKeyboard({
        startingResponse: group10With70And80PercentRuleBoxesResponse,
        deleteStatus: 200,
        responseAfterRefetch: group10With70PercentRuleBoxResponse,
      });

      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'By completing all of the following' })).toHaveFocus()
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /score of 80%/ })).not.toBeInTheDocument();
    });

    it('keeps the dialog open with an alert when the removal fails, and keeps the rule after Cancel', async () => {
      const user = userEvent.setup();
      await removeEightyPercentRuleFromKeyboard({
        startingResponse: group10With70And80PercentRuleBoxesResponse,
        deleteStatus: 500,
        responseAfterRefetch: group10With70And80PercentRuleBoxesResponse,
      });

      const dialog = await screen.findByRole('dialog', { name: removeRuleDialogName });
      expect(within(dialog).getByRole('alert')).toHaveTextContent('Couldn\'t remove this rule');
      expect(within(dialog).getByRole('button', { name: 'Remove' })).toBeEnabled();
      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(screen.getByRole('button', { name: eightyPercentRuleBoxMenuName })).toBeInTheDocument();
      // jsdom returns focus to the hidden "Remove rule" item; a browser returns it to the toggle, because focus-lock skips hidden items.
      expect(screen.getByRole('button', { name: eightyPercentRuleBoxMenuName }).closest('.rule-box'))
        .toContainElement(document.activeElement as HTMLElement);
      expect(axiosMock.history.delete).toHaveLength(1);
    });

    it('leaves the empty state, with no course or group card, when the last box on the page is removed', async () => {
      const user = userEvent.setup();
      const run = mockServerRepliesForRuleBoxDelete(group10With70PercentRuleBoxResponse, noGroupsOrCriteriaResponse);
      renderSection();
      expect(await screen.findByText('Demo Course')).toBeInTheDocument();

      await user.click(await screen.findByRole('button', { name: seventyPercentRuleBoxMenuName }));
      await user.click(screen.getByRole('button', { name: 'Remove rule' }));
      await confirmRemovalInDialog(user);
      await waitForHeldRefetch();
      await releaseRefetch(run);

      expect(await screen.findByText(byTextContent('No content associated with Data Literacy yet.')))
        .toBeInTheDocument();
      expect(screen.queryByText('Demo Course')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /By completing/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /More actions/ })).not.toBeInTheDocument();
    });

    it('enables the add controls again once the new rule box is discarded through its menu', async () => {
      const user = userEvent.setup();
      mockServerRepliesForRuleBoxDelete(group10With70PercentRuleBoxResponse, group10With70PercentRuleBoxResponse);
      renderSection();

      await user.click(await screen.findByRole('button', { name: 'Add Rule' }));
      // The new rule box opens its score popover, which hides the rest of the page until it closes.
      await user.keyboard('{Escape}');

      expect(screen.getByRole('button', { name: 'Add Rule' })).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByRole('button', { name: 'Add Rule Group' })).toHaveAttribute('aria-disabled', 'true');

      await user.click(screen.getByRole('button', { name: 'More actions for the new rule' }));
      await user.click(screen.getByRole('button', { name: 'Remove rule' }));

      expect(screen.queryByRole('button', { name: 'More actions for the new rule' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Rule' })).toHaveAttribute('aria-disabled', 'false');
      expect(screen.getByRole('button', { name: 'Add Rule Group' })).toHaveAttribute('aria-disabled', 'false');
    });

    it('disables every actions menu on the panel until the refetch lands', async () => {
      const user = userEvent.setup();
      const run = mockServerRepliesForRuleBoxDelete(
        group10With70And80PercentRuleBoxesResponse,
        group10With70PercentRuleBoxResponse,
      );
      renderSection();

      await user.click(await screen.findByRole('button', { name: eightyPercentRuleBoxMenuName }));
      await user.click(screen.getByRole('button', { name: 'Remove rule' }));
      await confirmRemovalInDialog(user);
      await waitForHeldRefetch();

      // The course menu, the group menu, and the 70% and 80% rule menus; the open dialog hides them from the
      // accessibility tree.
      const heldMenus = screen.getAllByRole('button', { name: /More actions/, hidden: true });
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

  describe('confirming a removal (#786)', () => {
    const baseOutline = buildOutlineIndex({
      sections: [{
        id: 'section-1',
        displayName: 'Section 1',
        children: [
          { id: 'sub-a', displayName: 'Subsection A' },
          { id: 'sub-c', displayName: 'Subsection C' },
        ],
      }],
    });
    const namedOutline = {
      ...baseOutline,
      courseStructure: { ...baseOutline.courseStructure, displayName: 'Demo Course' },
    };
    const without901: CompetencyCriteriaGroupsResponse = {
      groups: hierarchy,
      criteria: [eightyPercentCriterion],
      criteriaCount: 1,
      totalCriteriaCount: 1,
    };
    const chipRemoveName = 'Remove the association with Subsection A';
    const dialogName = 'Remove Subsection A from Data Literacy?';

    it('opens the dialog from a chip\'s "x" and sends nothing', async () => {
      const user = userEvent.setup();
      mockServerRepliesForRuleBoxDelete(group10With70And80PercentRuleBoxesResponse, without901, 200, namedOutline);
      renderSection();

      await user.click(await screen.findByRole('button', { name: chipRemoveName }));

      const dialog = await screen.findByRole('dialog', { name: dialogName });
      expect(
        within(dialog).getByText(
          'This can\'t be undone from this screen. Learners keep any mastery status they already have.',
        ),
      )
        .toBeInTheDocument();
      expect(axiosMock.history.delete).toHaveLength(0);
    });

    it('leaves the chip listed and sends nothing when Cancel is chosen', async () => {
      const user = userEvent.setup();
      mockServerRepliesForRuleBoxDelete(group10With70And80PercentRuleBoxesResponse, without901, 200, namedOutline);
      renderSection();
      await user.click(await screen.findByRole('button', { name: chipRemoveName }));

      await user.click(
        within(await screen.findByRole('dialog', { name: dialogName })).getByRole('button', { name: 'Cancel' }),
      );

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(screen.getByRole('button', { name: chipRemoveName })).toBeInTheDocument();
      expect(axiosMock.history.delete).toHaveLength(0);
    });

    it('closes on Escape without sending anything', async () => {
      const user = userEvent.setup();
      mockServerRepliesForRuleBoxDelete(group10With70And80PercentRuleBoxesResponse, without901, 200, namedOutline);
      renderSection();
      await user.click(await screen.findByRole('button', { name: chipRemoveName }));
      const dialog = await screen.findByRole('dialog', { name: dialogName });
      await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));

      await user.keyboard('{Escape}');

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(screen.getByRole('button', { name: chipRemoveName })).toBeInTheDocument();
      expect(axiosMock.history.delete).toHaveLength(0);
    });

    it('moves focus into the dialog when it opens', async () => {
      const user = userEvent.setup();
      mockServerRepliesForRuleBoxDelete(group10With70And80PercentRuleBoxesResponse, without901, 200, namedOutline);
      renderSection();

      await user.click(await screen.findByRole('button', { name: chipRemoveName }));

      const dialog = await screen.findByRole('dialog', { name: dialogName });
      await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
    });

    it('keeps the dialog open until the refetch lands, then closes it with the chip gone', async () => {
      const user = userEvent.setup();
      const run = mockServerRepliesForRuleBoxDelete(group10With70And80PercentRuleBoxesResponse, without901, 200, namedOutline);
      renderSection();
      await user.click(await screen.findByRole('button', { name: chipRemoveName }));
      const dialog = await screen.findByRole('dialog', { name: dialogName });

      await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
      await waitForHeldRefetch();

      expect(screen.getByRole('dialog', { name: dialogName })).toBeInTheDocument();
      expect(axiosMock.history.delete.map((request) => request.url)).toEqual([
        apiUrls.deleteCompetencyCriterion(tagId, 901),
      ]);
      await releaseRefetch(run);

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(screen.queryByRole('button', { name: chipRemoveName })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Remove the association with Subsection C' })).toBeInTheDocument();
    });

    it('keeps the dialog open and the chip listed when the request fails, and a retry removes it with no toast', async () => {
      const user = userEvent.setup();
      mockProfileAndOutline(namedOutline);
      axiosMock.onGet(groupsUrl).replyOnce(200, group10With70And80PercentRuleBoxesResponse);
      axiosMock.onGet(groupsUrl).replyOnce(200, group10With70And80PercentRuleBoxesResponse);
      axiosMock.onGet(groupsUrl).reply(200, without901);
      axiosMock.onDelete(apiUrls.deleteCompetencyCriterion(tagId, 901)).replyOnce(500);
      axiosMock.onDelete(apiUrls.deleteCompetencyCriterion(tagId, 901)).reply(200, { id: 901, archived: false });
      renderSection();
      await user.click(await screen.findByRole('button', { name: chipRemoveName }));
      const dialog = await screen.findByRole('dialog', { name: dialogName });

      await user.click(within(dialog).getByRole('button', { name: 'Remove' }));

      const alert = await within(dialog).findByRole('alert');
      expect(alert).toHaveTextContent('Couldn\'t remove this association');
      expect(alert).toHaveTextContent('Nothing was removed.');
      expect(screen.getByRole('button', { name: chipRemoveName, hidden: true })).toBeInTheDocument();
      expect(within(dialog).getByRole('button', { name: 'Remove' })).toBeEnabled();

      await user.click(within(dialog).getByRole('button', { name: 'Remove' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(screen.queryByRole('button', { name: chipRemoveName })).not.toBeInTheDocument();
      expect(axiosMock.history.delete).toHaveLength(2);
      expect(mockShowToast).not.toHaveBeenCalled();
    });

    it('opens the group dialog from "Remove group" with the count and the only-group sentence', async () => {
      const user = userEvent.setup();
      mockServerRepliesForRuleBoxDelete(group10With70And80PercentRuleBoxesResponse, noGroupsOrCriteriaResponse, 200, namedOutline);
      renderSection();

      await user.click(await screen.findByRole('button', { name: 'More actions for rule group 1 in Demo Course' }));
      await user.click(screen.getByRole('button', { name: 'Remove group' }));

      const dialog = await screen.findByRole('dialog', { name: 'Remove this group?' });
      expect(dialog).toHaveTextContent(
        'This also removes its 2 content associations. It\'s the only group for Demo Course, so that course will '
          + 'no longer count toward Data Literacy.',
      );
      expect(axiosMock.history.delete).toHaveLength(0);
    });

    it('opens the course dialog from "Remove from Data Literacy" with the course-group body', async () => {
      const user = userEvent.setup();
      mockServerRepliesForRuleBoxDelete(group10With70And80PercentRuleBoxesResponse, noGroupsOrCriteriaResponse, 200, namedOutline);
      renderSection();

      await user.click(await screen.findByRole('button', { name: 'More actions for Demo Course' }));
      await user.click(screen.getByRole('button', { name: 'Remove from Data Literacy' }));

      const dialog = await screen.findByRole('dialog', { name: 'Remove Demo Course from Data Literacy?' });
      expect(dialog).toHaveTextContent(
        'This also removes its 2 content associations, so Demo Course will no longer count toward Data Literacy.',
      );
      expect(axiosMock.history.delete).toHaveLength(0);
    });
  });
});
