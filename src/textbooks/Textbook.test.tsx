import userEvent from '@testing-library/user-event';

import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import {
  initializeMocks,
  render,
  screen,
} from '@src/testUtils';
import { getTextbooksApiUrl } from './data/api';
import { textbooksMock } from './__mocks__';
import { Textbooks } from '.';
import messages from './messages';

let axiosMock;
let validateUserPermissionsMock;
const courseId = 'course-v1:org+101+101';
const emptyTextbooksMock = { textbooks: [] };

const renderComponent = () =>
  render(
    <CourseAuthoringProvider courseId={courseId}>
      <Textbooks />
    </CourseAuthoringProvider>,
  );

describe('<Textbooks />', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();

    axiosMock = mocks.axiosMock;
    validateUserPermissionsMock = mocks.validateUserPermissionsMock;
    mockWaffleFlags();
    axiosMock
      .onGet(getTextbooksApiUrl(courseId))
      .reply(200, textbooksMock);
  });

  it('renders Textbooks component correctly', async () => {
    renderComponent();

    expect(await screen.findByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.breadcrumbContent.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.breadcrumbPagesAndResources.defaultMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.newTextbookButton.defaultMessage })).toBeInTheDocument();
    expect(screen.getAllByTestId('textbook-card')).toHaveLength(2);
    expect(screen.queryByTestId('textbooks-empty-placeholder')).not.toBeInTheDocument();
  });

  it('renders textbooks form when "New textbooks" button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const newTextbookButton = await screen.findByRole('button', { name: messages.newTextbookButton.defaultMessage });
    await user.click(newTextbookButton);
    expect(screen.getByTestId('textbook-form')).toBeInTheDocument();
  });

  it('renders Textbooks component with empty placeholder correctly', async () => {
    axiosMock
      .onGet(getTextbooksApiUrl(courseId))
      .reply(200, emptyTextbooksMock);

    renderComponent();

    expect(await screen.findByTestId('textbooks-empty-placeholder')).toBeInTheDocument();
    expect(screen.queryAllByTestId('textbook-card')).toHaveLength(0);
  });

  it('displays an alert when API responds with 403', async () => {
    axiosMock
      .onGet(getTextbooksApiUrl(courseId))
      .reply(403);
    renderComponent();

    expect(await screen.findByTestId('connectionErrorAlert')).toBeInTheDocument();
  });

  describe('with AuthZ enabled', () => {
    const mockPermissions = (canManagePagesAndResources: boolean) => {
      mockWaffleFlags({ enableAuthzCourseAuthoring: true });
      validateUserPermissionsMock.mockResolvedValue({ canViewPagesAndResources: true, canManagePagesAndResources });
    };

    it('lets view-only users consult textbooks with management actions disabled', async () => {
      mockPermissions(false);
      const user = userEvent.setup();
      renderComponent();

      expect(await screen.findAllByTestId('textbook-card')).toHaveLength(2);
      const actions = [
        screen.getByRole('button', { name: messages.newTextbookButton.defaultMessage }),
        ...screen.getAllByRole('button', { name: 'Edit' }),
        ...screen.getAllByRole('button', { name: 'Delete' }),
      ];
      expect(actions).toHaveLength(5);
      for (const action of actions) {
        expect(action).toBeDisabled();
        await user.click(action);
      }
      expect(screen.queryByTestId('textbook-form')).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      screen.getAllByRole('button', { name: 'View the PDF live' }).forEach(button => expect(button).toBeEnabled());
    });

    it('disables both creation entry points when a view-only list is empty', async () => {
      mockPermissions(false);
      axiosMock.onGet(getTextbooksApiUrl(courseId)).reply(200, emptyTextbooksMock);
      const user = userEvent.setup();
      renderComponent();

      const addFirst = await screen.findByRole('button', { name: 'Add your first textbook' });
      expect(addFirst).toBeDisabled();
      expect(screen.getByRole('button', { name: messages.newTextbookButton.defaultMessage })).toBeDisabled();
      await user.click(addFirst);
      expect(screen.queryByTestId('textbook-form')).not.toBeInTheDocument();
    });

    it('keeps management actions available to managers', async () => {
      mockPermissions(true);
      const user = userEvent.setup();
      renderComponent();

      expect(await screen.findAllByTestId('textbook-card')).toHaveLength(2);
      [...screen.getAllByRole('button', { name: 'Edit' }), ...screen.getAllByRole('button', { name: 'Delete' })]
        .forEach(button => expect(button).toBeEnabled());
      await user.click(screen.getByRole('button', { name: messages.newTextbookButton.defaultMessage }));
      expect(screen.getByTestId('textbook-form')).toBeInTheDocument();
    });
  });
});
