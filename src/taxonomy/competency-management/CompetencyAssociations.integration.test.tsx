import { buildOutlineIndex } from '@src/course-outline/__mocks__';
import { getCourseOutlineIndexApiUrl } from '@src/course-outline/data';
import type { Course } from '@src/studio-home/data/api';
import {
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
  courseA,
  courseB,
  courseBGroupsResponse,
  courseListUrl,
  criterion,
  defaultProfileResponse,
  eqRule,
  gteRule,
  mockScrollIntoView,
  noGroupsResponse,
  singleGroupResponse,
  tagId,
  twoCoursesResponse,
  twoGroupsResponse,
} from './__mocks__';
import { CompetencyAssociationsProvider } from './CompetencyAssociationsContext';
import CourseRow from './course-search/CourseRow';
import { CourseGroupList } from './criteria-groups';
import { apiUrls } from './data/api';
import type { CompetencyCriteriaGroupsResponse } from './data/types';
import { RemovalConfirmationModal } from './removal-confirmation';

let axiosMock: ReturnType<typeof initializeMocks>['axiosMock'];

const groupsUrl = apiUrls.competencyCriteriaGroups(tagId);
const profileUrl = apiUrls.defaultCompetencyRuleProfile();
const createUrl = apiUrls.createCompetencyCriterion(tagId);
const ruleUpdateUrl = apiUrls.updateCompetencyCriteriaRule(10);

const courseRow = (courseKey: string, displayName: string): Course => ({
  courseKey,
  displayName,
  lmsLink: null,
  number: 'CS102',
  org: 'OrgX',
  rerunLink: null,
  run: '2024',
  url: `/course/${courseKey}`,
});

const courseARow = courseRow(courseA, 'Course A');
const courseBRow = courseRow(courseB, 'Course B');

const outlineOf = (courseName: string, subsections: Record<string, string>) =>
  buildOutlineIndex({
    sections: [{
      id: `${courseName}-section`,
      displayName: 'Section 1',
      children: Object.entries(subsections).map(([id, displayName]) => ({
        id,
        displayName,
        overrides: { graded: true, usageKey: undefined },
      })),
    }],
    overrides: { courseStructure: { displayName: courseName } },
  });

/** The provider lists `rows` itself, as `CourseSearchBrowse` would show them, and scopes the groups to them. */
const renderPanel = (rows: Course[] = [courseBRow]) => {
  axiosMock.onGet(courseListUrl()).reply(200, buildCourseListResponse(rows.map((row) => row.courseKey)));
  return render(
    <CompetencyAssociationsProvider tagId={tagId} competencyName="Test Competency" competencyExternalId="CCRS-1.3">
      <CourseGroupList />
      <RemovalConfirmationModal />
      {rows.map((row) => <CourseRow key={row.courseKey} course={row} />)}
    </CompetencyAssociationsProvider>,
  );
};

// The author can edit these courses, so each header and rule box has an empty select button beside its editable control.
const groupHeaders = () => Array.from(document.querySelectorAll<HTMLElement>('.criteria-group-box__select-button'));
const groupCards = () => Array.from(document.querySelectorAll<HTMLElement>('.criteria-group-box'));
const ruleBoxControls = () => Array.from(document.querySelectorAll<HTMLElement>('.rule-box__select-button'));
const ruleBoxWithScore = (percent: string) => {
  const control = ruleBoxControls().find((candidate) => (
    within(candidate.closest<HTMLElement>('.rule-box')!).queryByText((text) => text.startsWith(`${percent}%`))
  ));
  if (!control) {
    throw new Error(`No rule box with a score of ${percent}`);
  }
  return control;
};
// After "Add Rule" on a group that already uses the default score, the score popover opens by itself and hides the rest of the page from role queries until it closes.
const closeScorePopover = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
};
// Group 10's only box scores 90%, so the default 70% is free for a new box.
const freeDefaultResponse = {
  ...singleGroupResponse,
  criteria: [criterion(900, 'existing-sub', 10, {
    ruleProfileId: null,
    ruleTypeOverride: 'grade',
    rulePayloadOverride: { op: 'gte', value: 0.9, scale: 'percent' },
  })],
};
const currentStates = (elements: HTMLElement[]) => elements.map((element) => element.getAttribute('aria-current'));

describe('competency associations over the real provider', () => {
  const scrollIntoView = mockScrollIntoView();
  let user: ReturnType<typeof userEvent.setup>;
  let mockShowToast: ReturnType<typeof initializeMocks>['mockShowToast'];

  beforeEach(() => {
    ({ axiosMock, mockShowToast } = initializeMocks());
    user = userEvent.setup();
    axiosMock.onGet(profileUrl).reply(200, defaultProfileResponse);
  });

  it('expanding a course moves selection to its last group and last rule box, reopening its collapsed card', async () => {
    axiosMock.onGet(groupsUrl).reply(200, courseBGroupsResponse);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineOf('Course A', {}));
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(
      200,
      outlineOf('Course B', { 'b-sub-1': 'Homework 1', 'b-sub-2': 'Homework 2' }),
    );
    renderPanel();
    // Selection starts on course A's group, with the course B card collapsed.
    await screen.findAllByText(/^By completing/);
    await user.click(groupHeaders()[0]);
    expect(groupHeaders()[0]).toHaveAttribute('aria-current', 'true');
    await user.click(await screen.findByRole('button', { name: 'Collapse Course B' }));
    expect(screen.queryByText('Homework 1')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Expand' }));

    // Course B's groups are 20 (ordering 0) and 21 (ordering 1). Group 21's last box is the `eq` override.
    const headers = groupHeaders();
    expect(currentStates(headers)).toEqual(['false', 'false', 'true']);
    const lastRuleBox = ruleBoxWithScore('100');
    expect(lastRuleBox).toHaveAttribute('aria-current', 'true');
    expect(ruleBoxWithScore('70')).toHaveAttribute('aria-current', 'false');
    expect(screen.getByRole('button', { name: 'Collapse Course B' })).toBeInTheDocument();
    expect(scrollIntoView.mock.contexts.at(-1)).toBe(lastRuleBox.parentElement);
  });

  it('selecting a subsection in a course with no groups creates its group and rule box and selects them', async () => {
    let groupsReply = singleGroupResponse;
    axiosMock.onGet(groupsUrl).reply(() => [200, groupsReply]);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(
      200,
      outlineOf('Course A', { 'existing-sub': 'Homework A' }),
    );
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(
      200,
      outlineOf('Course B', { 'b-sub-1': 'Homework 1' }),
    );
    axiosMock.onPost(createUrl).reply(() => {
      groupsReply = {
        ...twoCoursesResponse,
        criteria: [...singleGroupResponse.criteria, criterion(901, 'b-sub-1', 20)],
      };
      return [201, {
        id: 901,
        group_id: 20,
        rule_profile_id: 1,
        rule_type_override: null,
        rule_payload_override: null,
        object_tag_id: tagId,
      }];
    });
    renderPanel();
    // Course A's only group is auto-selected, so a missing `group_id` is not the selection-less default.
    expect(await screen.findByRole('heading', { name: 'From within Course A ...' })).toBeInTheDocument();
    expect(groupHeaders()).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Expand' }));
    await user.click(await screen.findByRole('button', { name: 'Expand' }));

    await user.click(await screen.findByRole('button', { name: 'Associate CCRS-1.3 with Homework 1' }));

    expect(await screen.findByRole('heading', { name: 'From within Course B ...' })).toBeInTheDocument();
    expect(axiosMock.history.post).toHaveLength(1);
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({ object_id: 'b-sub-1' });
    const headers = groupHeaders();
    expect(currentStates(headers)).toEqual(['false', 'true']);
    const ruleBoxes = ruleBoxControls();
    expect(currentStates(ruleBoxes)).toEqual(['false', 'true']);
    expect(scrollIntoView.mock.contexts).toContain(ruleBoxes[1].parentElement);
  });

  it('selecting a subsection in a course while selection is on another course adds to that course\'s last group', async () => {
    axiosMock.onGet(groupsUrl).reply(200, courseBGroupsResponse);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(
      200,
      outlineOf('Course A', { 'a-sub-1': 'Homework A' }),
    );
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(200, outlineOf('Course B', {}));
    axiosMock.onPost(createUrl).reply(201, {
      id: 902,
      group_id: 10,
      rule_profile_id: 1,
      rule_type_override: null,
      rule_payload_override: null,
      object_tag_id: tagId,
    });
    renderPanel([courseARow, courseBRow]);
    await screen.findAllByRole('heading', { name: /^From within Course/ });
    // Expanding course A and then course B leaves the selection on course B's last group.
    await user.click(screen.getAllByRole('button', { name: 'Expand' })[0]);
    await user.click(screen.getAllByRole('button', { name: 'Expand' })[1]);
    expect(currentStates(groupHeaders())).toEqual(['false', 'false', 'true']);
    await user.click(screen.getAllByRole('button', { name: 'Expand' })[0]);

    await user.click(await screen.findByRole('button', { name: 'Associate CCRS-1.3 with Homework A' }));

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({ object_id: 'a-sub-1', group_id: 10 });
  });

  it('focuses the new placeholder group\'s score settings button, with the popover closed, after "Add Rule Group"', async () => {
    axiosMock.onGet(groupsUrl).reply(200, courseBGroupsResponse);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineOf('Course A', {}));
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(
      200,
      outlineOf('Course B', { 'b-sub-1': 'Homework 1', 'b-sub-2': 'Homework 2' }),
    );
    renderPanel();
    await screen.findByText('Homework 1');
    const addButtons = screen.getAllByRole('button', { name: 'Add Rule Group' });
    const scoreSettingsButtonsBefore = screen.getAllByRole('button', { name: /With a score of/ });

    await user.click(addButtons[addButtons.length - 1]);

    const scoreSettingsButtonsAfter = screen.getAllByRole('button', { name: /With a score of/ });
    expect(scoreSettingsButtonsAfter).toHaveLength(scoreSettingsButtonsBefore.length + 1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(scoreSettingsButtonsAfter.at(-1)).toHaveFocus());
  });

  it('collapsing a course discards its placeholder group, so expanding it again shows one group card', async () => {
    axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(
      200,
      outlineOf('Course A', { 'a-sub-1': 'Homework A' }),
    );
    renderPanel([]);
    await screen.findByRole('heading', { name: 'From within Course A ...' });
    expect(groupCards()).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Add Rule Group' }));
    expect(groupCards()).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Collapse Course A' }));
    await user.click(await screen.findByRole('button', { name: 'Expand Course A' }));

    await screen.findByRole('heading', { name: 'From within Course A ...' });
    expect(groupCards()).toHaveLength(1);
  });

  it('+ Rule on a group whose default score is taken opens the new box\'s score settings with the percentage selected', async () => {
    axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineOf('Course A', {}));
    renderPanel([courseARow]);

    await user.click(await screen.findByRole('button', { name: 'Add Rule' }));

    const input = within(screen.getByRole('dialog', { name: 'Competency Completion Rule' }))
      .getByRole('textbox') as HTMLInputElement;
    await waitFor(() => expect(input).toHaveFocus());
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(input.value.length);

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    const buttons = screen.getAllByRole('button', { name: /With a score of/ });
    await waitFor(() => expect(document.activeElement).toBe(buttons.at(-1)));
  });

  it('taking the suggested score keeps the dialog open, then Escape returns focus to the score settings button', async () => {
    axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineOf('Course A', {}));
    renderPanel([courseARow]);
    await user.click(await screen.findByRole('button', { name: 'Add Rule' }));
    const dialog = await screen.findByRole('dialog', { name: 'Competency Completion Rule' });
    const scoreSettingsButton = document.querySelector(
      '.score-threshold-field__score-settings-button[aria-expanded="true"]',
    );
    expect(scoreSettingsButton).toBeInstanceOf(HTMLButtonElement);

    await user.click(within(dialog).getByRole('button', { name: 'Use 75% or higher' }));

    const input = within(screen.getByRole('dialog')).getByRole('textbox');
    await waitFor(() => expect(input).toHaveFocus());
    expect(input).toHaveValue('75');
    expect(screen.getByRole('dialog')).not.toHaveTextContent(/Another rule in this group already uses/);

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(document.activeElement).toBe(scoreSettingsButton));
  });

  it('+ Rule on a group whose default score is free focuses the new box\'s score settings button without opening the popover', async () => {
    axiosMock.onGet(groupsUrl).reply(200, freeDefaultResponse);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineOf('Course A', {}));
    renderPanel([courseARow]);

    await user.click(await screen.findByRole('button', { name: 'Add Rule' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: /With a score of 70%/ })).toHaveFocus());
  });

  it('creates the criterion once the author takes the suggested score after a taken default is rejected', async () => {
    axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(
      200,
      outlineOf('Course A', { 'a-sub-1': 'Homework A' }),
    );
    axiosMock.onPost(createUrl).reply(201, {
      id: 903,
      group_id: 10,
      rule_profile_id: null,
      rule_type_override: 'grade',
      rule_payload_override: { op: 'gte', value: 0.75, scale: 'percent' },
      object_tag_id: tagId,
    });
    renderPanel([courseARow]);
    await screen.findByRole('heading', { name: 'From within Course A ...' });
    await user.click(screen.getByRole('button', { name: 'Add Rule' }));
    expect(screen.getByRole('dialog')).toHaveTextContent(/Another rule in this group already uses 70% or higher/);
    expect(screen.getByRole('button', { name: 'Use 75% or higher' })).toBeInTheDocument();
    await closeScorePopover(user);
    await user.click(await screen.findByRole('button', { name: 'Expand' }));
    await user.click(await screen.findByRole('button', { name: 'Expand' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(await screen.findByRole('button', { name: 'Associate CCRS-1.3 with Homework A' }));

    expect(axiosMock.history.post).toHaveLength(0);
    const dialog = await screen.findByRole('dialog', { name: 'Competency Completion Rule' });
    expect(within(dialog).getByRole('textbox')).toBeInvalid();
    const scoreSuggestionLink = within(dialog).getByRole('button', { name: 'Use 75% or higher' });
    await waitFor(() => expect(scoreSuggestionLink).toHaveFocus());
    await user.click(scoreSuggestionLink);
    await waitFor(() => expect(within(screen.getByRole('dialog')).getByRole('textbox')).toHaveFocus());
    expect(within(screen.getByRole('dialog')).getByRole('textbox')).toHaveValue('75');
    await closeScorePopover(user);
    await user.click(screen.getByRole('button', { name: 'Associate CCRS-1.3 with Homework A' }));

    await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      object_id: 'a-sub-1',
      group_id: 10,
      rule_type_override: 'grade',
      rule_payload_override: { op: 'gte', value: 0.75, scale: 'percent' },
    });
  });

  it('moves the selection when a second group header and then a second rule box are clicked', async () => {
    axiosMock.onGet(groupsUrl).reply(200, courseBGroupsResponse);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineOf('Course A', {}));
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(
      200,
      outlineOf('Course B', { 'b-sub-1': 'Homework 1', 'b-sub-2': 'Homework 2' }),
    );
    renderPanel();
    await screen.findByText('Homework 1');
    expect(currentStates(groupHeaders())).toEqual(['false', 'false', 'false']);

    await user.click(groupHeaders()[1]);

    expect(currentStates(groupHeaders())).toEqual(['false', 'true', 'false']);
    expect(currentStates(ruleBoxControls())).toEqual(['false', 'false']);

    await user.click(ruleBoxWithScore('100'));

    expect(currentStates(groupHeaders())).toEqual(['false', 'false', 'true']);
    expect(currentStates(ruleBoxControls())).toEqual(['false', 'true']);
  });

  it('shows an empty saved group\'s placeholder box without opening its score settings when the group is selected', async () => {
    axiosMock.onGet(groupsUrl).reply(200, twoGroupsResponse);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineOf('Course A', {}));
    renderPanel([courseARow]);
    await screen.findAllByText(/^By completing/);
    expect(screen.queryByRole('button', { name: /With a score of/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add Rule Group' }));

    await user.click(groupHeaders()[1]);

    expect(currentStates(groupHeaders())).toEqual(['false', 'true']);
    const placeholderButtons = screen.getAllByRole('button', { name: /With a score of/ });
    expect(placeholderButtons).toHaveLength(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    // A stale just-added flag would focus this button when the placeholder mounts.
    expect(placeholderButtons[0]).not.toHaveFocus();

    await user.click(groupHeaders()[0]);

    expect(currentStates(groupHeaders())).toEqual(['true', 'false']);
    expect(screen.getAllByRole('button', { name: /With a score of/ })).toHaveLength(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  describe('focus after a committed score', () => {
    const scoreSettingsButton = (percent: number) =>
      screen.getByRole('button', { name: new RegExp(`With a score of ${percent}%`) });

    const commitScore = async (percent: string) => {
      const input = within(screen.getByRole('dialog')).getByRole('textbox');
      await user.clear(input);
      await user.type(input, percent);
      await user.keyboard('{Enter}');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    };

    it('keeps focus on the same score settings button after a saved score is committed', async () => {
      let groupsReply = singleGroupResponse;
      axiosMock.onGet(groupsUrl).reply(() => [200, groupsReply]);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineOf('Course A', {}));
      axiosMock.onPatch(ruleUpdateUrl).reply(() => {
        const updated = criterion(900, 'existing-sub', 10, {
          ruleProfileId: null,
          ruleTypeOverride: 'grade',
          rulePayloadOverride: { op: 'gte', value: 0.85, scale: 'percent' },
        });
        groupsReply = { ...singleGroupResponse, criteria: [updated] };
        return [200, [updated]];
      });
      renderPanel([courseARow]);
      const buttonBefore = await screen.findByRole('button', { name: /With a score of 70%/ });
      await user.click(buttonBefore);

      await commitScore('85');

      await waitFor(() => expect(buttonBefore).toHaveTextContent('85%'));
      await waitFor(() => expect(document.activeElement).toBe(buttonBefore));
      expect(ruleBoxWithScore('85')).toHaveAttribute('aria-current', 'true');
    });

    it('keeps focus on the same placeholder score settings button, with its dialog closed, after the placeholder score is committed', async () => {
      axiosMock.onGet(groupsUrl).reply(200, freeDefaultResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineOf('Course A', {}));
      renderPanel([courseARow]);
      await user.click(await screen.findByRole('button', { name: 'Add Rule' }));
      const buttonBefore = screen.getAllByRole('button', { name: /With a score of 70%/ }).at(-1)!;
      await waitFor(() => expect(buttonBefore).toHaveFocus());
      await user.click(buttonBefore);

      await commitScore('80');

      await waitFor(() => expect(buttonBefore).toHaveTextContent('80%'));
      await waitFor(() => expect(document.activeElement).toBe(buttonBefore));
      expect(buttonBefore).toHaveAttribute('aria-expanded', 'false');
      expect(axiosMock.history.patch).toHaveLength(0);
    });

    it('keeps focus on the same score settings button when a saved score is rejected and the popover is then dismissed', async () => {
      axiosMock.onGet(groupsUrl).reply(200, singleGroupResponse);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineOf('Course A', {}));
      axiosMock.onPatch(ruleUpdateUrl).reply(500);
      renderPanel([courseARow]);
      await user.click(await screen.findByRole('button', { name: /With a score of 70%/ }));
      const input = within(screen.getByRole('dialog')).getByRole('textbox');
      await user.clear(input);
      await user.type(input, '85');
      await user.keyboard('{Enter}');
      await waitFor(() => expect(axiosMock.history.patch).toHaveLength(1));
      await waitFor(() => expect(input).toHaveValue('70'));

      await closeScorePopover(user);

      expect(scoreSettingsButton(70)).toHaveFocus();
    });
  });

  it('shows the empty state when every course outline is refused with 403', async () => {
    axiosMock.onGet(groupsUrl).reply(200, courseBGroupsResponse);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(403);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(403);
    renderPanel();

    // Course B's criteria are in a listed course, but the author can open none of the listed courses.
    expect(
      await screen.findByText(byTextContent(
        'No content associated with Test Competency that you can open in the courses listed here. '
          + '2 associations are in listed courses you can\'t open.',
      )),
    )
      .toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /^From within Course/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/^By completing/)).not.toBeInTheDocument();
  });

  it('shows the failure toast and adds no chip when the create request fails', async () => {
    axiosMock.onGet(groupsUrl).reply(200, courseBGroupsResponse);
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, outlineOf('Course A', {}));
    axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(
      200,
      outlineOf('Course B', { 'b-sub-3': 'Homework 3' }),
    );
    axiosMock.onPost(createUrl).reply(500);
    renderPanel();
    await user.click(await screen.findByRole('button', { name: 'Expand' }));
    await user.click(await screen.findByRole('button', { name: 'Expand' }));

    await user.click(await screen.findByRole('button', { name: 'Associate CCRS-1.3 with Homework 3' }));

    await waitFor(() =>
      expect(mockShowToast).toHaveBeenCalledWith(
        'There was a problem creating this association. Please try again.',
        undefined,
        undefined,
        expect.anything(),
      )
    );
    // The outline row is the only place the new subsection's name appears, so no chip was added for it.
    expect(screen.getAllByText('Homework 3')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Associate CCRS-1.3 with Homework 3' })).toBeEnabled();
  });

  describe('removing a group through the ⋮ menu', () => {
    const courseAOutline = outlineOf('Course A', { 'a-sub-1': 'Homework 1', 'a-sub-2': 'Homework 2' });
    // Group 10 holds two rule boxes, the default 70% first and a 100% override last. Group 11 holds Homework 1.
    const withTwoGroups: CompetencyCriteriaGroupsResponse = {
      groups: [...twoGroupsResponse.groups],
      criteria: [
        criterion(900, 'x-1', 10),
        criterion(901, 'x-2', 10, { ruleProfileId: null, ruleTypeOverride: 'grade', rulePayloadOverride: eqRule }),
        criterion(902, 'a-sub-1', 11),
      ],
      criteriaCount: 3,
      totalCriteriaCount: 3,
    };
    const withoutGroup11: CompetencyCriteriaGroupsResponse = {
      groups: twoGroupsResponse.groups.filter((item) => item.id !== 11),
      criteria: withTwoGroups.criteria.filter((item) => item.groupId !== 11),
      criteriaCount: 2,
      totalCriteriaCount: 2,
    };
    const removeUrl = apiUrls.competencyCriteriaGroup(tagId, 11);
    const createdBody = (groupId: number) => ({
      id: 950,
      group_id: groupId,
      rule_profile_id: 1,
      rule_type_override: null,
      rule_payload_override: null,
      object_tag_id: tagId,
    });

    const mockDeleteThenRefetch = (
      before: CompetencyCriteriaGroupsResponse,
      after: CompetencyCriteriaGroupsResponse,
    ) => {
      let reply = before;
      axiosMock.onGet(groupsUrl).reply(() => [200, reply]);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, courseAOutline);
      axiosMock.onDelete(removeUrl).reply(() => {
        reply = after;
        return [200];
      });
    };

    const openRuleGroupMenu = async (position: number) => {
      await user.click(screen.getByRole('button', { name: `More actions for rule group ${position} in Course A` }));
    };

    /** Every removal opens its confirmation first; nothing is sent until its Remove button is clicked. */
    const confirmRemoval = async () => {
      const dialog = await screen.findByRole('dialog');
      expect(axiosMock.history.delete).toHaveLength(0);
      await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    };

    const expandCourseA = async () => {
      await user.click(await screen.findByRole('button', { name: 'Expand' }));
      await user.click(await screen.findByRole('button', { name: 'Expand' }));
      await screen.findByText('Homework 2');
    };

    it('unmarks the removed group\'s subsections as associated in the content panel', async () => {
      mockDeleteThenRefetch(withTwoGroups, withoutGroup11);
      renderPanel([courseARow]);
      await expandCourseA();
      expect(screen.queryByRole('button', { name: 'Associate CCRS-1.3 with Homework 1' })).not.toBeInTheDocument();

      await openRuleGroupMenu(2);
      await user.click(screen.getByRole('button', { name: 'Remove group' }));
      await confirmRemoval();

      expect(await screen.findByRole('button', { name: 'Associate CCRS-1.3 with Homework 1' })).toBeInTheDocument();
      expect(axiosMock.history.delete).toHaveLength(1);
      expect(groupHeaders()).toHaveLength(1);
    });

    it('selects the first rule box of the group above, which then receives the next associated subsection', async () => {
      mockDeleteThenRefetch(withTwoGroups, withoutGroup11);
      axiosMock.onPost(createUrl).reply(201, createdBody(10));
      renderPanel([courseARow]);
      await expandCourseA();
      await user.click(groupHeaders()[1]);
      expect(currentStates(groupHeaders())).toEqual(['false', 'true']);

      await openRuleGroupMenu(2);
      await user.click(screen.getByRole('button', { name: 'Remove group' }));
      await confirmRemoval();

      await waitFor(() => expect(groupHeaders()).toHaveLength(1));
      expect(currentStates(groupHeaders())).toEqual(['true']);
      expect(currentStates(ruleBoxControls())).toEqual(['true', 'false']);
      await user.click(await screen.findByRole('button', { name: 'Associate CCRS-1.3 with Homework 2' }));

      await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
        object_id: 'a-sub-2',
        group_id: 10,
        rule_type_override: 'grade',
        rule_payload_override: gteRule,
      });
    });

    it('leaves the focused empty state after the last group is removed and creates a new course group on the next association', async () => {
      const onlyGroup: CompetencyCriteriaGroupsResponse = {
        groups: singleGroupResponse.groups,
        criteria: [criterion(902, 'a-sub-1', 10)],
        criteriaCount: 1,
        totalCriteriaCount: 1,
      };
      let reply = onlyGroup;
      axiosMock.onGet(groupsUrl).reply(() => [200, reply]);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, courseAOutline);
      axiosMock.onDelete(apiUrls.competencyCriteriaGroup(tagId, 10)).reply(() => {
        reply = noGroupsResponse;
        return [200];
      });
      axiosMock.onPost(createUrl).reply(201, createdBody(12));
      renderPanel([courseARow]);
      await expandCourseA();
      await user.click(screen.getByRole('button', { name: 'More actions for rule group 1 in Course A' }));
      await user.click(screen.getByRole('button', { name: 'Remove group' }));
      await confirmRemoval();

      const emptyMessage = await screen.findByText(byTextContent('No content associated with Test Competency yet.'));
      await waitFor(() => expect(emptyMessage.parentElement).toHaveFocus());
      expect(groupHeaders()).toHaveLength(0);
      await user.click(await screen.findByRole('button', { name: 'Associate CCRS-1.3 with Homework 2' }));

      await waitFor(() => expect(axiosMock.history.post).toHaveLength(1));
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({ object_id: 'a-sub-2' });
    });

    it('moves keyboard focus to the new selected group\'s select button after a keyboard removal', async () => {
      mockDeleteThenRefetch(withTwoGroups, withoutGroup11);
      renderPanel([courseARow]);
      await expandCourseA();
      await user.click(groupHeaders()[1]);
      screen.getByRole('button', { name: 'More actions for rule group 2 in Course A' }).focus();

      await user.keyboard('{Enter}{ArrowDown}');
      const item = await screen.findByRole('button', { name: 'Remove group' });
      await waitFor(() => expect(item).toHaveFocus());
      await user.keyboard('{Enter}');
      await confirmRemoval();

      await waitFor(() => expect(groupHeaders()).toHaveLength(1));
      await waitFor(() => expect(groupHeaders()[0]).toHaveFocus());
    });

    it('expands a collapsed course group holding the new target and focuses inside it', async () => {
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseA)).reply(200, courseAOutline);
      axiosMock.onGet(getCourseOutlineIndexApiUrl(courseB)).reply(200, outlineOf('Course B', {}));
      let reply = courseBGroupsResponse;
      axiosMock.onGet(groupsUrl).reply(() => [200, reply]);
      axiosMock.onDelete(apiUrls.competencyCriteriaGroup(tagId, 2)).reply(() => {
        reply = singleGroupResponse;
        return [200];
      });
      renderPanel([courseARow]);
      await screen.findAllByRole('heading', { name: /^From within Course/ });
      await user.click(screen.getByRole('button', { name: 'Collapse Course A' }));
      expect(screen.getByRole('button', { name: 'Expand Course A' })).toBeInTheDocument();
      await user.click(groupHeaders()[1]);

      await user.click(screen.getByRole('button', { name: 'More actions for Course B' }));
      await user.click(screen.getByRole('button', { name: 'Remove from Test Competency' }));
      await confirmRemoval();

      await waitFor(() => expect(groupHeaders()).toHaveLength(1));
      await waitFor(() => expect(groupHeaders()[0]).toHaveFocus());
      expect(screen.getByRole('button', { name: 'Collapse Course A' })).toBeInTheDocument();
    });
  });
});
