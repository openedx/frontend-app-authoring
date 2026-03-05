import userEvent from '@testing-library/user-event';

import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
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
});
