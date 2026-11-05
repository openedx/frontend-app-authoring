import {
  initializeMocks,
  render,
  screen,
  userEvent,
  waitFor,
  within,
} from '@src/testUtils';
import type {
  CompetencyAssociationsContextValue,
  PendingRemoval,
} from '@src/taxonomy/competency-management/CompetencyAssociationsContext';
import { MockCompetencyAssociationsProvider } from '@src/taxonomy/competency-management/__mocks__';
import { RemovalFailure, RemovalTargetKind } from '@src/taxonomy/competency-management/constants';
import RemovalConfirmationModal from './RemovalConfirmationModal';

const closingLine = 'This can\'t be undone from this screen. Learners keep any mastery status they already have.';

const renderModal = (
  pendingRemoval: PendingRemoval | null,
  overrides: Partial<CompetencyAssociationsContextValue> = {},
) =>
  render(
    <MockCompetencyAssociationsProvider value={{ competencyName: 'Inference', pendingRemoval, ...overrides }}>
      <RemovalConfirmationModal />
    </MockCompetencyAssociationsProvider>,
  );

const associationRemoval = (contentName: string | null = '5 Whys + Fishbone Deep Dive'): PendingRemoval => ({
  target: { kind: RemovalTargetKind.Association, criterionId: 1, returnFocusTo: 'group' },
  summary: { kind: RemovalTargetKind.Association, contentName },
  failure: null,
});

const ruleGroupRemoval = (isOnlyGroupInCourse: boolean): PendingRemoval => ({
  target: { kind: RemovalTargetKind.RuleGroup, groupId: 10 },
  summary: { kind: RemovalTargetKind.RuleGroup, associationCount: 2, courseName: 'Demo Course', isOnlyGroupInCourse },
  failure: null,
});

const courseGroupRemoval = (): PendingRemoval => ({
  target: { kind: RemovalTargetKind.CourseGroup, groupId: 1 },
  summary: { kind: RemovalTargetKind.CourseGroup, associationCount: 3, courseName: 'Demo Course' },
  failure: null,
});

const ruleBoxRemoval = (
  overrides: Partial<Extract<PendingRemoval['summary'], { kind: RemovalTargetKind.RuleBox; }>> = {},
  failure: PendingRemoval['failure'] = null,
): PendingRemoval => ({
  target: { kind: RemovalTargetKind.RuleBox, groupId: 10, criterionIds: [1, 2] },
  summary: {
    kind: RemovalTargetKind.RuleBox,
    contentNames: ['Quiz A', 'Quiz B'],
    otherRuleCount: 1,
    courseName: 'Demo Course',
    isOnlyGroupInCourse: false,
    ...overrides,
  },
  failure,
});

const bodyOf = () => within(screen.getByRole('dialog')).getByText(closingLine).parentElement as HTMLElement;

describe('RemovalConfirmationModal', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders nothing without a pending removal', () => {
    renderModal(null);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  describe('association', () => {
    it('names the content and the competency in its title and has only the closing line as its body', () => {
      renderModal(associationRemoval());

      const dialog = screen.getByRole('dialog', { name: 'Remove 5 Whys + Fishbone Deep Dive from Inference?' });
      expect(within(dialog).getByText(closingLine)).toBeInTheDocument();
      expect(within(dialog).getAllByRole('paragraph')).toHaveLength(1);
    });

    it('has exactly a Cancel and a Remove button and no text input', () => {
      renderModal(associationRemoval());

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getAllByRole('button').map((button) => button.textContent)).toEqual(['Cancel', 'Remove']);
      expect(within(dialog).queryByRole('textbox')).not.toBeInTheDocument();
    });

    it.each(['5 Whys + Fishbone Deep Dive', 'Final Project'])('has the same body for %s', (contentName) => {
      renderModal(associationRemoval(contentName));

      expect(bodyOf().textContent).toBe(closingLine);
    });

    it('shows the fallback label for content its course outline no longer lists', () => {
      renderModal(associationRemoval(null));

      expect(screen.getByRole('dialog', { name: 'Remove Content unavailable from Inference?' })).toBeInTheDocument();
    });
  });

  describe('rule group', () => {
    it('shows its association count in bold', () => {
      renderModal(ruleGroupRemoval(false));

      const dialog = screen.getByRole('dialog', { name: 'Remove this group?' });
      expect(within(dialog).getByText('2 content associations').tagName).toBe('STRONG');
      expect(bodyOf()).toHaveTextContent('This also removes its 2 content associations.');
      expect(bodyOf()).not.toHaveTextContent('only group');
    });

    it('adds the only-group sentence naming the course and the competency in bold', () => {
      renderModal(ruleGroupRemoval(true));

      expect(screen.getByText(
        (_content, element) =>
          element?.tagName === 'P'
          && element.textContent
            === 'This also removes its 2 content associations. It\'s the only group for Demo Course, so that course '
              + 'will no longer count toward Inference.',
      )).toBeInTheDocument();
      expect(within(screen.getByRole('dialog')).getByText('Inference').tagName).toBe('STRONG');
    });
  });

  it('names the course and counts its associations for a course group', () => {
    renderModal(courseGroupRemoval());

    const dialog = screen.getByRole('dialog', { name: 'Remove Demo Course from Inference?' });
    expect(within(dialog).getByText('3 content associations').tagName).toBe('STRONG');
    expect(within(dialog).getByText('Inference').tagName).toBe('STRONG');
    expect(bodyOf()).toHaveTextContent(
      'This also removes its 3 content associations, so Demo Course will no longer count toward Inference.',
    );
  });

  describe('rule box', () => {
    it('lists the content names and says the group\'s other rule stays', () => {
      renderModal(ruleBoxRemoval());

      expect(screen.getByRole('dialog', { name: 'Remove this rule from Inference?' })).toBeInTheDocument();
      expect(bodyOf()).toHaveTextContent(
        'This removes its 2 content associations, Quiz A and Quiz B. The group\'s other rule stays.',
      );
    });

    it.each([
      [
        'says the group\'s other rules stay when there are several',
        { otherRuleCount: 2 },
        'The group\'s other rules stay.',
      ],
      [
        'says the group is removed too when it is the group\'s only rule',
        { otherRuleCount: 0 },
        'It\'s the group\'s only rule, so the group is removed too.',
      ],
      [
        'says the course stops counting when it is the course\'s only rule',
        { otherRuleCount: 0, isOnlyGroupInCourse: true },
        'It\'s the only rule for Demo Course, so that course will no longer count toward Inference.',
      ],
    ])('%s', (_name, summary, sentence) => {
      renderModal(ruleBoxRemoval(summary));

      expect(bodyOf()).toHaveTextContent(sentence);
    });

    it('uses the singular for a rule holding one content association', () => {
      renderModal(ruleBoxRemoval({ contentNames: ['Quiz A'] }));

      expect(bodyOf()).toHaveTextContent('This removes its 1 content association, Quiz A.');
    });

    it('shows the fallback label for content its course outline no longer lists', () => {
      renderModal(ruleBoxRemoval({ contentNames: ['Quiz A', null] }));

      expect(bodyOf()).toHaveTextContent('This removes its 2 content associations, Quiz A and Content unavailable.');
    });
  });

  describe('actions', () => {
    it('cancels from the Cancel button without confirming', async () => {
      const user = userEvent.setup();
      const cancelRemoval = jest.fn();
      const confirmRemoval = jest.fn();
      renderModal(associationRemoval(), { cancelRemoval, confirmRemoval });

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(cancelRemoval).toHaveBeenCalledTimes(1);
      expect(confirmRemoval).not.toHaveBeenCalled();
    });

    it('confirms from the Remove button without cancelling', async () => {
      const user = userEvent.setup();
      const cancelRemoval = jest.fn();
      const confirmRemoval = jest.fn().mockResolvedValue(undefined);
      renderModal(associationRemoval(), { cancelRemoval, confirmRemoval });

      await user.click(screen.getByRole('button', { name: 'Remove' }));

      expect(confirmRemoval).toHaveBeenCalledTimes(1);
      expect(cancelRemoval).not.toHaveBeenCalled();
    });

    it('cancels on Escape', async () => {
      const user = userEvent.setup();
      const cancelRemoval = jest.fn();
      renderModal(associationRemoval(), { cancelRemoval });
      await waitFor(() => expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement));

      await user.keyboard('{Escape}');

      expect(cancelRemoval).toHaveBeenCalledTimes(1);
    });
  });

  describe('failure alert', () => {
    it.each([
      [
        'association',
        { ...associationRemoval(), failure: RemovalFailure.NothingRemoved },
        'Couldn\'t remove this association',
      ],
      [
        'rule group',
        { ...ruleGroupRemoval(false), failure: RemovalFailure.NothingRemoved },
        'Couldn\'t remove this group',
      ],
      [
        'course group',
        { ...courseGroupRemoval(), failure: RemovalFailure.NothingRemoved },
        'Couldn\'t remove this course',
      ],
      ['rule box', ruleBoxRemoval({}, RemovalFailure.NothingRemoved), 'Couldn\'t remove this rule'],
    ])('shows the %s title and the nothing-removed text above the body', (_kind, pending, failedTitle) => {
      renderModal(pending);

      const alert = within(screen.getByRole('dialog')).getByRole('alert');
      expect(alert).toHaveClass('alert-danger');
      expect(alert).toHaveTextContent(failedTitle);
      expect(alert).toHaveTextContent('Nothing was removed. Try again, or refresh the page if this keeps happening.');
      const closing = screen.getByText(closingLine);
      expect(alert.compareDocumentPosition(closing) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('says some of the content was removed for a partly removed rule box', () => {
      renderModal(ruleBoxRemoval({ contentNames: ['Quiz B'] }, RemovalFailure.PartlyRemoved));

      const alert = within(screen.getByRole('dialog')).getByRole('alert');
      expect(alert).toHaveTextContent('Couldn\'t remove this rule');
      expect(alert).toHaveTextContent(
        'Some of its content was removed. Try again to remove the rest, or refresh the page if this keeps happening.',
      );
    });

    it('shows no alert before a request has failed', () => {
      renderModal(associationRemoval());

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
