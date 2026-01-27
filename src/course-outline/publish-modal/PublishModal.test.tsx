import { initializeMocks, screen, render } from '@src/testUtils';

import PublishModal from './PublishModal';
import messages from './messages';
import userEvent from '@testing-library/user-event';


jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: (message) => message.defaultMessage,
  }),
}));

const currentItemMock = {
  id: 'section-id-1',
  displayName: 'Publish',
  childInfo: {
    displayName: 'Subsection',
    children: [
      {
        displayName: 'Subsection 1',
        id: 1,
        hasChanges: true,
        childInfo: {
          displayName: 'Unit',
          children: [
            {
              id: 11,
              displayName: 'Subsection_1 Unit 1',
              hasChanges: true,
            },
          ],
        },
      },
      {
        displayName: 'Subsection 2',
        id: 2,
        hasChanges: true,
        childInfo: {
          displayName: 'Unit',
          children: [
            {
              id: 21,
              displayName: 'Subsection_2 Unit 1',
              hasChanges: true,
            },
          ],
        },
      },
      {
        displayName: 'Subsection 3',
        id: 3,
        childInfo: {
          children: [],
        },
      },
    ],
  },
};

const onCloseMock = jest.fn();
const onPublishSubmitMock = jest.fn();

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: () => ({
    courseId: 5,
    courseUsageKey: 'course-usage-key',
    isPublishModalOpen: true,
    currentPublishModalData: {value: currentItemMock},
    closePublishModal: onCloseMock,
  }),
}));

jest.mock('@src/course-outline/data/apiHooks', () => ({
  ...jest.requireActual('@src/course-outline/data/apiHooks'),
  usePublishCourseItem: () => ({
    mutateAsync: onPublishSubmitMock,
  }),
}));

const renderComponent = () => render(
  <PublishModal />
);

describe('<PublishModal />', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders PublishModal component correctly', async () => {
    renderComponent();

    expect(await screen.findByText(messages.title.defaultMessage)).toBeInTheDocument();
    expect(await screen.findByText(messages.description.defaultMessage)).toBeInTheDocument();
    expect(await screen.findByText(/Subsection 1/i)).toBeInTheDocument();
    expect(await screen.findByText(/Subsection_1 Unit 1/i)).toBeInTheDocument();
    expect(await screen.findByText(/Subsection 2/i)).toBeInTheDocument();
    expect(await screen.findByText(/Subsection_2 Unit 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/Subsection 3/i)).not.toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.cancelButton.defaultMessage })).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: messages.publishButton.defaultMessage })).toBeInTheDocument();
  });

  it('calls the onClose function when the cancel button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const cancelButton = await screen.findByRole('button', { name: messages.cancelButton.defaultMessage });
    await user.click(cancelButton);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls the onPublishSubmit function when save button is clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const publishButton = await screen.findByRole('button', { name: messages.publishButton.defaultMessage });
    await user.click(publishButton);
    expect(onPublishSubmitMock).toHaveBeenCalledTimes(1);
  });
});
